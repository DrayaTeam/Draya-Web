const fs = require('fs');
const filePath = 'src/app/features/teacher/services/teacher-notifications.service.ts';
let content = fs.readFileSync(filePath, 'utf8');

const ar1 = Buffer.from('2KrZgtix2YrYsSDYrNiv2YrYrw==', 'base64').toString('utf8');
const ar2 = Buffer.from('2KrZhSDYpdmG2YfYp9ihINiq2YLYsdmK2LEg2KfZhNij2K/Yp9ihINmE2YTYt9in2YTYqS4g2YrZhdmD2YbZgyDYp9mE2KLZhiDZhdiv2KfYrNi52KrZhS4=', 'base64').toString('utf8');
const ar3 = Buffer.from('2KrZhtio2YrZhzog2KrYsdin2KzYuSDZhdiz2KrZiNmMINi32KfZhNio', 'base64').toString('utf8');
const ar4 = Buffer.from('2KrZhSDYsdi12K8g2KrYsdin2KzYuSDYrti32YrYsSDZgdmKINij2K/Yp9ihINij2K3YryDYp9mE2LfZhNin2Kgg2YHZiiDZhdmI2LbZiNi5OiA=', 'base64').toString('utf8');
const ar5 = Buffer.from('2YXYudin2YTYrNipINin2YTZhdin2K/YqQ==', 'base64').toString('utf8');
const ar6 = Buffer.from('2KrZhdiqINmF2LnYp9mE2KzYqSDYp9mE2YXYp9iv2Kkg2KfZhNiq2LnZhNmK2YXZitipINio2YbYrNin2K0g2KjZhti42KfZhSDYp9mE2LDZg9in2KEg2KfZhNin2LXYt9mG2KfYudmKLiAo', 'base64').toString('utf8');
const ar7 = Buffer.from('2YHYtNmEINmF2LnYp9mE2KzYqSDYp9mE2YXYp9iv2Kk=', 'base64').toString('utf8');
const ar8 = Buffer.from('2K3Yr9irINiO2LfYoyDYo9ir2YbYp9ihINmF2LnYp9mE2KzYqSDYp9mE2YXYp9iv2Kkg2KfZhNiq2LnZhNmK2YXZitipOiA=', 'base64').toString('utf8');

// I will just replace the strings in the file since they are currently garbled. Wait, the Python script used CP1252, so it's a mess. Let's just overwrite the whole file using Base64.