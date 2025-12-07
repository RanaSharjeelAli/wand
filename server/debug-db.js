const Database = require('better-sqlite3');
const path = require('path');

// Open the database
const db = new Database(path.join(__dirname, 'data/wand-ai.db'));

console.log('\n=== ALL CHATS ===');
const chats = db.prepare('SELECT * FROM chats ORDER BY updatedAt DESC').all();
console.log(chats);

console.log('\n=== ALL MESSAGES ===');
const messages = db.prepare('SELECT * FROM messages ORDER BY timestamp ASC').all();

messages.forEach(msg => {
  console.log('\n--- Message ---');
  console.log('ID:', msg.id);
  console.log('Chat ID:', msg.chatId);
  console.log('Is User:', msg.isUser);
  console.log('Text:', msg.text);
  console.log('Text length:', msg.text ? msg.text.length : 0);
  console.log('Timestamp:', msg.timestamp);
  console.log('Has agents:', msg.agents ? 'Yes' : 'No');
  console.log('Has results:', msg.results ? 'Yes' : 'No');
});

db.close();
console.log('\n=== Database inspection complete ===\n');
