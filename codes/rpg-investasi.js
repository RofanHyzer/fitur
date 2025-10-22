/**
 * [ FEATURE RPG INVESTASI BY DIKSS ]
 * 
 * @Author : Dikss-Tzy
 * @Description : Fitur investasi dengan harga 1JT / LOT dan memberikan return 4.8% / hari (144% / bulan). Fitur ini berguna sebagai tabungan user.
 * @Sosmed : https://web.dikssoffc.xyz
 * @Note : Hapus Wm Rejeki Seret + Bisulan Seumur Hidup Amin
 */

let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  let hargaPerLot = 1000000;
  let user = global.db.data.users[m.sender] || {};

  if (!user.money) user.money = 0;
  if (!user.investment) {
    user.investment = { 
      balance: 0, 
      lastUpdate: 0, 
      pendapatan: 0, 
      lot: 0, 
      lastDeposit: 0, 
      lastWdPorto: 0, 
      lastWdIncome: 0 
    };
  }

  let formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateInterest = (balance, periods) => {
    const ratePerPeriod = 0.002;
    return Math.round(balance * Math.pow(1 + ratePerPeriod, periods) - balance);
  };

  const updateInvestment = () => {
    const now = Date.now();
    const periodsElapsed = Math.floor((now - user.investment.lastUpdate) / (1000 * 60 * 60));
    if (periodsElapsed > 0) {
      const interest = calculateInterest(user.investment.balance, periodsElapsed);
      user.investment.pendapatan += interest;
      user.investment.lastUpdate += periodsElapsed * (1000 * 60 * 60);
    }
  };
  
  if (command === 'wdporto') {
    const cooldownTime = 3 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    if (now - user.investment.lastWdPorto < cooldownTime) {
      let remainingTime = cooldownTime - (now - user.investment.lastWdPorto);
      let days = Math.floor(remainingTime / 1000 / 60 / 60 / 24);
      let hours = Math.floor((remainingTime / 1000 / 60 / 60) % 24);
      let minutes = Math.floor((remainingTime / 1000 / 60) % 60);
      return m.reply(`Kamu sudah melakukan penarikan akhir akhir ini, tunggu selama *${days} HARI, ${hours} JAM dan ${minutes} MENIT* untuk melakukan penarikan lagi`);
    }
    const withdrawAmount = parseInt(args[0], 10);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return conn.reply(m.chat, '*⛔ Masukkan jumlah sesuai dengan lot yang ada miliki.*', m);
    }

    updateInvestment();

    if (withdrawAmount > user.investment.lot) {
      return conn.reply(
        m.chat,
        `*⛔ Anda hanya memiliki ${user.investment.lot} Lot, tidak dapat menarik Sebanyak ${withdrawAmount} Lot*`,
        m
      );
    }

    let totalEh = withdrawAmount * hargaPerLot
    user.investment.balance -= totalEh;
    user.investment.lot -= withdrawAmount;
    user.investment.lastWdPorto = now;
    user.bank += totalEh;

    return conn.reply(
      m.chat,
      `✅ *Penarikan sebesar ${withdrawAmount} Lot berhasil.*\n*Sisa saldo investasi Anda: ${formatRupiah(user.investment.balance)} Atau ${user.investment.lot} Lot.*`,
      m
    );
  }
  
  if (command === 'wdincome') {
    const cooldownTime = 24 * 60 * 60 * 1000;
    const now = Date.now();
    if (now - user.investment.lastWdIncome < cooldownTime) {
      let remainingTime = cooldownTime - (now - user.investment.lastWdIncome);
      let days = Math.floor(remainingTime / 1000 / 60 / 60 / 24);
      let hours = Math.floor((remainingTime / 1000 / 60 / 60) % 24);
      let minutes = Math.floor((remainingTime / 1000 / 60) % 60);
      return m.reply(`❌ Kamu sudah melakukan penarikan akhir akhir ini, tunggu selama *${hours} JAM dan ${minutes} MENIT* untuk melakukan penarikan lagi`);
    }
    const wdEy = parseInt(args[0], 10);
    let biayaAdmin = Math.floor(wdEy * 0.025);
    let totalNya = wdEy - biayaAdmin;
    if (isNaN(wdEy) || wdEy <= 0) {
      return conn.reply(m.chat, '*🚫 Masukkan jumlah saldo yang ingin ditarik dengan benar.*', m);
    }

    if (wdEy < 100000) {
      return conn.reply(m.chat, "*🚫 Minimal Penarikan Adalah Rp 100.000*", m);
    }

    updateInvestment();

    if (wdEy > user.investment.pendapatan) {
      return conn.reply(
        m.chat,
        `*🚫 Saldo income tidak mencukupi. Saldo Income Anda saat ini: ${formatRupiah(user.investment.pendapatan)}*`,
        m
      );
    }

    user.investment.pendapatan -= wdEy;
    user.investment.lastWdIncome = now;
    user.bank += totalNya;

    return conn.reply(
      m.chat,
      `✅ *Penarikan sebesar ${formatRupiah(wdEy)} berhasil.*\n> *Dikenai biaya admin sebesar 2.5%. - ${formatRupiah(biayaAdmin)}.*`,
      m
    );
  }

  if (command === 'deposit') {
    const cooldownTime = 3 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (now - user.investment.lastDeposit < cooldownTime) {
      let remainingTime = cooldownTime - (now - user.investment.lastDeposit);
      let days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
      let hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
      let minutes = Math.floor((remainingTime / (1000 * 60)) % 60);

      return m.reply(`🚫 *Anda baru saja melakukan deposit!* 🚫\n\nMohon tunggu selama *${days} HARI, ${hours} JAM, dan ${minutes} MENIT* sebelum deposit kembali.`);
    }

    const depositAmount = parseInt(args[0], 10);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return conn.reply(m.chat, '❌ *Masukkan jumlah lot yang ingin dibeli.*\n💰 *1 Lot = Rp 1.000.000*', m);
    }

    let maxLot = 10;
    if (user.investment.lot + depositAmount > maxLot) {
      return m.reply(`⚠️ *Maksimal lot yang bisa dimiliki adalah ${maxLot}.*\n📉 *Sisa lot yang bisa Anda beli: ${maxLot - user.investment.lot} Lot*`);
    }

    let totalHarga = depositAmount * hargaPerLot;
    if (user.bank < totalHarga) {
      return conn.reply(m.chat, '❌ *Saldo bank tidak cukup untuk melakukan deposit!*', m);
    }

    updateInvestment();

    user.bank -= totalHarga;
    user.investment.balance += totalHarga;
    user.investment.lot += depositAmount;
    user.investment.lastUpdate = now;
    user.investment.lastDeposit = now;

    return conn.reply(m.chat, `✅ *Deposit berhasil!* ✅\n💵 *Jumlah: ${depositAmount} Lot*\n🏦 *Saldo Investasi: ${formatRupiah(user.investment.balance)} (${user.investment.lot} Lot)*`, m);
  }

  if (command === 'cekaset') {
    updateInvestment();   
    let cap = `📊 *Status Investasi Anda* 📊\n━━━━━━━━━━━━━━━━━━\n💰 *Lot:* ${user.investment.lot} Lot\n💵 *Income:* ${formatRupiah(user.investment.pendapatan || 0)}\n🏦 *Porto:* ${formatRupiah(user.investment.balance)}\n━━━━━━━━━━━━━━━━━━\n🔹 *Terima Kasih telah berinvestasi!*`;

    return conn.reply(m.chat, cap, m);
  }

  if (command === 'investasi') {
    return conn.reply(m.chat, `📌 *Tata Cara Investasi* 📌\n━━━━━━━━━━━━━━━━━━\n💼 *${usedPrefix}deposit <jumlah lot>*\n> Menyetor saldo ke investasi\n📊 *${usedPrefix}cekaset*\n> Mengecek saldo investasi\n🏦 *${usedPrefix}wdporto <jumlah lot>*\n> Menarik saldo investasi\n💵 *${usedPrefix}wdincome <jumlah>* \n> Menarik saldo hasil investasi\n━━━━━━━━━━━━━━━━━━\n📈 *Keuntungan?* Ketik *${usedPrefix}benefit*`, m);
  }

  if (command === 'benefit') {
  	return conn.reply(m.chat, `*Keuntungan Investasi*\n\n- Uang Terjaga 100% Aman ✅\n- Dapat Income 4,8% / Hari\n- Melipat Gandakan Aset ✅\n\nMau Investasi? ketik *.investasi* dengan modal 1 juta`, m )
  }
};
// Interval untuk update investasi
setInterval(() => {
  const now = Date.now();
  for (let userId in global.db.data.users) {
    let user = global.db.data.users[userId];
    if (user.investment) {
      const periodsElapsed = Math.floor((now - user.investment.lastUpdate) / (1000 * 60 * 60));
      if (periodsElapsed > 0) {
        const interest = Math.round(user.investment.balance * Math.pow(1 + 0.002, periodsElapsed) - user.investment.balance);
        user.investment.pendapatan += interest;
        user.investment.lastUpdate += periodsElapsed * (1000 * 60 * 60);
      }
    }
  }
}, 1000 * 60 * 60);

handler.help = ['investasi'];
handler.tags = ['rpg'];
handler.command = /^(investasi|deposit|wdincome|wdporto|cekaset|benefit)$/i;
handler.group = true
handler.register = true;

export default handler;