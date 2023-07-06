// check if includes is CaSe SeNsItIve

const msg = 'hewwo';

// console.log(msg.toLowerCase().includes('nigger' || 'nigga' || 'nigro'));

// it is case sensitive
// needs foreach to check for multiple words

const bad_words = ['nigger', 'nigga', 'nigro'];
var flag = false;

// bad_words.forEach(bad_word => {
//     msg.toLowerCase().includes(bad_word) ? flag = true : flag = false;
//     console.log(flag);
//     if (flag) return;
// });

// forEach isn't the best for this case => for loop

for (let i = 0; i < bad_words.length; i++) {
    flag = msg.toLowerCase().includes(bad_words[i]);
    if (flag) break;
}
// solution

console.log(flag);