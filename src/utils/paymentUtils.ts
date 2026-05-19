export const calculateDynamicBaseAmount = (profile: any): number => {
  if (!profile) return 0;
  let baseAmount = profile.baseAmount || 0;
  const paymentType = profile.paymentType;
  
  if (paymentType === 'Semanal' || paymentType === 'Mensual') {
    const startDate = new Date(profile.planStartDate || profile.registrationDate || new Date().toISOString());
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - startDate.getTime());
    
    if (paymentType === 'Semanal') {
      const weeksPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
      baseAmount = baseAmount * (weeksPassed + 1);
    } else if (paymentType === 'Mensual') {
      const monthsPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
      baseAmount = baseAmount * (monthsPassed + 1);
    }
  }
  
  return baseAmount;
};
