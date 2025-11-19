const readline = require('readline');
const db = require('./db');
require('./events/logger'); // Initialize event logger
const fs = require('fs');//for file conversion
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
function exportData() {
  const records = db.listRecords();
  const now = new Date();
  const header =
`Export Date: ${now.toISOString()}
Total Records: ${records.length}
File: export.txt
-------------------------------------\n`;

  const body = records.map(r =>
    `ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`
  ).join('\n');

  fs.writeFileSync('export.txt', header + body);

  console.log(' Data exported successfully to export.txt.');
  menu();
}

function sortRecords() {
  rl.question('Sort by either (name/date): ', field => {
    field = field.toLowerCase();
    if (field !== 'name' && field !== 'date') {
      console.log('Invalid field.');
      return menu();
    }

    rl.question('Enter Order (asc/desc): ', order => {
      order = order.toLowerCase();
      if (order !== 'asc' && order !== 'desc') {
        console.log('Invalid order.');
        return menu();
      }

      let records = [...db.listRecords()];

      records.sort((a, b) => {
        if (field === 'name') {
          const n1 = a.name.toLowerCase();
          const n2 = b.name.toLowerCase();
          return order === 'asc' ? n1.localeCompare(n2) : n2.localeCompare(n1);
        } else {
          const d1 = a.id;
          const d2 = b.id;
          return order === 'asc' ? d1 - d2 : d2 - d1;
        }
      });

      console.log('\n Sorted Records:');
      records.forEach(r => {
        console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`);
      });

      menu();
    });
  });
}

function searchRecords() {
  rl.question('Enter search keyword: ', keyword => {
    if (!keyword.trim()) {
      console.log(' Please enter a valid search term.');
      menu();
      return;
    }
    
    const records = db.listRecords();
    const matches = records.filter(r => 
      r.name.toLowerCase().includes(keyword.toLowerCase()) ||
      r.id.toString().includes(keyword)
    );
    
    if (matches.length === 0) {
      console.log(' No records found.');
    } else {
      console.log(`\n Found ${matches.length} matching record(s):`);
      matches.forEach((r, idx) => {
        const created = new Date(r.id).toISOString().split('T')[0];
        console.log(`${idx + 1}. ID: ${r.id} | Name: ${r.name} | Created: ${created}`);
      });
    }
    menu();
  });
}

function menu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Export Data
8. Exit
=====================
  `);

  rl.question('Choose option: ', ans => {
    switch (ans.trim()) {
      case '1':
        rl.question('Enter name: ', name => {
          rl.question('Enter value: ', value => {
            db.addRecord({ name, value });
            console.log(' Record added successfully!');
            menu();
          });
        });
        break;

      case '2':
        const records = db.listRecords();
        if (records.length === 0) console.log('No records found.');
        else records.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`));
        menu();
        break;

      case '3':
        rl.question('Enter record ID to update: ', id => {
          rl.question('New name: ', name => {
            rl.question('New value: ', value => {
              const updated = db.updateRecord(Number(id), name, value);
              console.log(updated ? ' Record updated!' : ' Record not found.');
              menu();
            });
          });
        });
        break;

      case '4':
        rl.question('Enter record ID to delete: ', id => {
          const deleted = db.deleteRecord(Number(id));
          console.log(deleted ? ' Record deleted!' : ' Record not found.');
          menu();
        });
        break;

      case '5':
        searchRecords();
        break;
      case '6':
        sortRecords();
        break;
      case '7':
        exportData();
        break;
      case '8':
        console.log(' Exiting NodeVault...');
        rl.close();
        break;
      default:
        console.log('Invalid option.');
        menu();
    }
  });
}

menu();
