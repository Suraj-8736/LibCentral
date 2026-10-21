/**
 * Calculate late days and fine amount
 * @param {Date|string} dueDate
 * @param {Date|string} returnDate (defaults to now)
 * @param {number} ratePerDay (defaults to 5)
 * @returns {{ lateDays: number, fine: number }}
 */
const calculateFine = (dueDate, returnDate = new Date(), ratePerDay = 5) => {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);

  // Set times to midnight for clean calendar-day difference calculation
  due.setHours(0, 0, 0, 0);
  returned.setHours(0, 0, 0, 0);

  const diffTime = returned.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return {
      lateDays: diffDays,
      fine: diffDays * Number(ratePerDay),
    };
  }

  return {
    lateDays: 0,
    fine: 0,
  };
};

module.exports = calculateFine;
