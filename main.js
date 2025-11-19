const readline = require('readline');
const db = require('./db');
require('./events/logger'); // Initialize event logger
const fs = require('fs'); // for file conversion

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function viewVaultStats() {
  db.listRecords().then(records => {
    if (records.length === 0) {
      console.log(' No records in vault.');
      return menu();
    }

    const total = records.length;
    const latest = new Date(Math.max(...records.map(r => r.id)));
    const earliest = new Date(Math.min(...records.map(r => r.id)));

    const longest = records.reduce((a, b) =>
      b.name.length > a.name.length ? b : a
    );

    const stats = `
Vault Statistics:
--------------------------
Total Records: ${total}
Last Modified: ${latest.toISOString()}
Longest Name: ${longest.name} (${longest.name.length} characters)
Earliest Record: ${earliest.toISOString().split('T')[0]}
Latest Record: ${latest.toISOString().split('T')[0]}
`;

    console.log(stats);
    menu();
  }).catch(err => {
    console.error('Error fetching stats:', err);
    menu();
  });
}

function createBackup() {
  if (!fs.existsSync('backups')) fs.mkdirSync('backups');

  db.listRecords().then(records => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backups/backup_${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(records, null, 2));
    console.log(`Backup created: ${filename}`);
  }).catch(err => {
    console.error('Error creating backup:', err);
  });
}

function exportData() {
  db.listRecords().then(records => {
    const now = new Date();
    const header = `Export Date: ${now.toISOString()}
Total Records: ${records.length}
File: export.txt
-------------------------------------
`;

    const body = records.map(r =>
      `ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`
    ).join('\n');

    fs.writeFileSync('export.txt', header + body);
    console.log('Data exported successfully to export.txt.');
    menu();
  }).catch(err => {
    console.error('Error exporting data:', err);
    menu();
  });
}

function sortRecords() {
  rl.question('Sort by (name/date): ', field => {
    field = field.toLowerCase();
    if (field !== 'name' && field !== 'date') {
      console.log(' Invalid field.');
      return menu();
    }

    rl.question('Enter Order (asc/desc): ', order => {
      order = order.toLowerCase();
      if (order !== 'asc' && order !== 'desc') {
        console.log(' Invalid order.');
        return menu();
      }

      db.listRecords().then(data => {
        let records = [...data];

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
      }).catch(err => {
        console.error('Error sorting records:', err);
        menu();
      });
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
    
    db.listRecords().then(records => {
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
    }).catch(err => {
      console.error('Error searching records:', err);
      menu();
    });
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
8. View Vault Statistics
9. Exit
=====================
  `);

  rl.question('Choose option: ', ans => {
    switch (ans.trim()) {
      case '1':
        rl.question('Enter name: ', name => {
          rl.question('Enter value: ', value => {
            db.addRecord({ name, value })
              .then(() => {
                createBackup();
                console.log(' Record added successfully and backup created!');
                menu();
              })
              .catch(err => {
                console.error('Error adding record:', err);
                menu();
              });
          });
        });
        break;

      case '2':
        db.listRecords()
          .then(records => {
            if (records.length === 0) {
              console.log('No records found.');
            } else {
              records.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`));
            }
            menu();
          })
          .catch(err => {
            console.error('Error listing records:', err);
            menu();
          });
        break;

      case '3':
        rl.question('Enter record ID to update: ', id => {
          rl.question('New name: ', name => {
            rl.question('New value: ', value => {
              db.updateRecord(Number(id), name, value)
                .then(updated => {
                  console.log(updated ? 'Record updated!' : ' Record not found.');
                  menu();
                })
                .catch(err => {
                  console.error('Error updating record:', err);
                  menu();
                });
            });
          });
        });
        break;

      case '4':
        rl.question('Enter record ID to delete: ', id => {
          db.deleteRecord(Number(id))
            .then(deleted => {
              if (deleted) {
                createBackup();
                console.log(' Record deleted and backup created!');
              } else {
                console.log(' Record not found.');
              }
              menu();
            })
            .catch(err => {
              console.error('Error deleting record:', err);
              menu();
            });
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
        viewVaultStats();
        break;

      case '9':
        console.log(' Exiting NodeVault...');
        rl.close();
        process.exit(0);
        break;

      default:
        console.log('Invalid option.');
        menu();
    }
  });
}

menu();
