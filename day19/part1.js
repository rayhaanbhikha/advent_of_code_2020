const fs = require('fs');
const [dRules, dMessages] = fs.readFileSync('./input.txt', { encoding: 'utf-8' }).trim().split('\n\n');

const rules = dRules.split('\n');
const messages = dMessages.split('\n');

// console.log(rules);
// console.log(messages);

const rulesingleCharRegEx = new RegExp(/^\ \"(\w){1}\"$/, 's')
const ruleNormalRegEx = new RegExp(/(\d)+/, 's');
const rulePipeRegEx = new RegExp(/\|/, 's');

class Rule{
  constructor(num, rule) {
    this.num = num;
    this.rule = rule;

    if (rulesingleCharRegEx.test(rule)) {
      this.rule = rule.replace(/(\"|\ )/g, '');
    } else {
      this.nestedRules = Array.from(new Set(this.rule.replace(/(\|\ )/g, '').split(' ')));
    }
  }

  get isComplete() {
    return !ruleNormalRegEx.test(this.rule);
  }

  update(rule) {
    // (1){1}(?!\d)
    const aReg = new RegExp(`(${rule.num}){1}(?!\\d)`, 'g')
    // console.log(aReg, aReg.exec(this.rule));
    this.rule = this.rule.replace(aReg, rule.rule);
  }

  polish() {
    if (this.rule.includes('|')) {
      this.rule = `(${this.rule.replace(/(\"|\ )/g, '')})`
    }
    if (this.num === '0' && this.isComplete) {
      this.rule = `^${this.rule}$`;
    }
  }
}

const rulesWeKnow = new Map();

const ruleMap = rules.reduce((acc, rule) => {
  const [num, ruleValue] = rule.split(':');
  const newRule = new Rule(num, ruleValue.trim());
  if (newRule.rule.includes('a') || newRule.rule.includes('b')) {
    rulesWeKnow.set(num, newRule);
  } else {
    acc[num] = newRule;
  }
  return acc;
}, {});


console.log(rulesWeKnow);
console.log(ruleMap);
// console.log(rulesWeKnow.get('4'))
// console.log(ruleMap, ruleMap[0].isComplete);

const label = 'start';
console.time(label);
do {
  for (const ruleWeDontKnow in ruleMap) {
    if (Object.hasOwnProperty.call(ruleMap, ruleWeDontKnow)) {
      const rule = ruleMap[ruleWeDontKnow];
      const nestedRules = rule.nestedRules;
      nestedRules.forEach(nestedRule => {
        if (rulesWeKnow.has(nestedRule)) {
          const ruleWeKnow = rulesWeKnow.get(nestedRule);
          rule.update(ruleWeKnow)
        }
      })
      rule.polish();
      if (rule.isComplete) {
        rulesWeKnow.set(rule.num, rule);
        if (rule.num !== '0') {
          delete ruleMap[ruleWeDontKnow]
        }
      }
    }
  }
  console.log(ruleMap)
} while (!ruleMap[0].isComplete);
console.timeEnd(label);

// console.log('\n=======')
// ruleMap[3].update(rulesWeKnow.get('1'));
// ruleMap[3].update(rulesWeKnow.get('10'));
// ruleMap[3].polish();
// console.log(ruleMap);

// ruleMap[2].update(rulesWeKnow.get('4'));
// ruleMap[2].update(rulesWeKnow.get('5'));
// console.log(ruleMap[2].isComplete);
// console.log(ruleMap[2].polish())
// console.log(ruleMap);
// // ruleMap[2].update(bRule);
// // ruleMap[2].bracket();

// console.log(ruleMap);
// // console.log(ruleMap[0].isComplete);

// // ruleMap[0].update(aRule)
// // ruleMap[0].update(ruleMap[2])
// // console.log(ruleMap);

const rule0 = new RegExp(rulesWeKnow.get('0').rule);
console.log(rule0);

let sum = 0;
messages.forEach(message => {
  if (rule0.test(message)) {
    sum++;
  }
})
console.log(sum);