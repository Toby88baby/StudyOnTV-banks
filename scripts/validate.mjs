// 校验 banks/ 下的题库并重建 index.json。
// 规则和 App 端（LocalStore.upsertQuestion / docs/question-format.md）保持一致，
// 改规则时两边要一起改，否则题能过 CI 却导不进 App。
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const banksDir = join(root, 'banks');
const TYPES = ['single', 'multiple', 'boolean', 'text', 'subjective'];
const LANGUAGES = ['', 'zh-CN', 'zh-HK', 'zh-TW', 'en-US', 'en-GB'];
const RAW_BASE = 'https://raw.githubusercontent.com/chadyi/StudyOnTV-banks/main/banks/';
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/chadyi/StudyOnTV-banks@main/banks/';

const errors = [];
const entries = [];

function fail(file, message) {
  errors.push(`${file}：${message}`);
}

function checkBank(file) {
  let bank;
  const text = readFileSync(join(banksDir, file), 'utf8');
  try {
    bank = JSON.parse(text);
  } catch (error) {
    fail(file, `不是合法 JSON（${error.message}）`);
    return;
  }
  const meta = ['name', 'author', 'license'];
  for (const key of meta) {
    if (typeof bank[key] !== 'string' || !bank[key].trim()) fail(file, `缺少 ${key}`);
  }
  if (bank.version !== 2) fail(file, 'version 必须是 2');
  if (!Array.isArray(bank.items) || bank.items.length < 1 || bank.items.length > 5000) {
    fail(file, 'items 需要 1–5000 道题');
    return;
  }
  const stems = new Set();
  bank.items.forEach((item, index) => {
    const where = `第 ${index + 1} 题`;
    if (!item || typeof item !== 'object') return fail(file, `${where}不是对象`);
    const type = item.type || 'single';
    if (!TYPES.includes(type)) fail(file, `${where}题型不支持：${type}`);
    if (typeof item.q !== 'string' || !item.q.trim()) return fail(file, `${where}缺少题干`);
    if (item.q.length > 5000) fail(file, `${where}题干超过 5000 字`);
    if (/<[a-z/][^>]*>/i.test(item.q)) fail(file, `${where}题干不要写 HTML`);
    const stem = item.q.replace(/\s+/g, '').replace(/[，。？?！!、；;：:“”"'（）()]/g, '').toLowerCase();
    if (stems.has(stem)) fail(file, `${where}题干重复`);
    stems.add(stem);
    if (type === 'text') {
      if (!Array.isArray(item.answers) || !item.answers.length) fail(file, `${where}填空题缺少 answers`);
      else if (item.answers.some(a => typeof a !== 'string' || !a.trim())) fail(file, `${where}填空答案不能为空`);
    } else if (type === 'subjective') {
      if (!String(item.modelAnswer || '').trim()) fail(file, `${where}主观题缺少 modelAnswer`);
    } else {
      const options = type === 'boolean' ? ['正确', '错误'] : item.a;
      if (!Array.isArray(options) || options.length < 2 || options.length > 8) fail(file, `${where}需要 2–8 个选项`);
      else if (options.some(o => typeof o !== 'string' || !o.trim())) fail(file, `${where}选项不能为空`);
      if (type === 'multiple') {
        const indices = item.correctIndices;
        if (!Array.isArray(indices) || !indices.length) fail(file, `${where}多选题缺少 correctIndices`);
        else if (indices.some(i => !Number.isInteger(i) || i < 0 || i >= options.length)) fail(file, `${where}答案序号超出选项范围`);
      } else if (type === 'single') {
        if (!Number.isInteger(item.k) || item.k < 0 || item.k >= options.length) fail(file, `${where}答案序号超出选项范围`);
      } else if (![0, 1].includes(item.k)) fail(file, `${where}判断题的 k 只能是 0 或 1`);
    }
    if (item.difficulty !== undefined && (!Number.isInteger(item.difficulty) || item.difficulty < 1 || item.difficulty > 5)) {
      fail(file, `${where}难度需要是 1–5`);
    }
    if (item.language !== undefined && !LANGUAGES.includes(item.language)) fail(file, `${where}朗读语言不支持：${item.language}`);
    for (const key of ['image', 'audio']) {
      const value = item[key];
      if (value === undefined || value === '') continue;
      if (typeof value !== 'string' || !/^https?:\/\//.test(value)) fail(file, `${where}${key} 必须是 http(s) 地址`);
    }
  });
  const subjects = [...new Set(bank.items.map(item => item.subject).filter(Boolean))];
  entries.push({
    name: bank.name,
    subject: bank.subject || subjects.slice(0, 3).join(' / '),
    level: bank.level || '',
    count: bank.items.length,
    author: bank.author,
    license: bank.license,
    description: bank.description || '',
    file,
    url: CDN_BASE + encodeURIComponent(file),
    mirror: RAW_BASE + encodeURIComponent(file),
    sha256: createHash('sha256').update(text).digest('hex'),
    ...(bank.updatedAt ? {updatedAt: bank.updatedAt} : {})
  });
}

const files = readdirSync(banksDir).filter(name => name.endsWith('.json')).sort();
if (!files.length) fail('banks/', '没有题库文件');
for (const file of files) checkBank(file);

if (errors.length) {
  console.error(`✗ ${errors.length} 个问题：`);
  for (const error of errors.slice(0, 50)) console.error('  - ' + error);
  if (errors.length > 50) console.error(`  …还有 ${errors.length - 50} 条`);
  process.exit(1);
}

entries.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
// 不写生成时间：每天跑一次就会产生无意义 diff，CI 自动提交会变成噪音
const index = {version: 1, name: 'StudyOnTV 题库共享', banks: entries};
writeFileSync(join(root, 'index.json'), JSON.stringify(index, null, 2) + '\n');
console.log(`✓ ${files.length} 个题库，共 ${entries.reduce((n, e) => n + e.count, 0)} 道题`);
