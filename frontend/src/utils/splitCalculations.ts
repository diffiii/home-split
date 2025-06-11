import { SplitConfiguration, SplitMember } from '../types';

export interface SplitResult {
  user_id: number;
  amount: string;
}

const distributeRemainder = (baseCents: number[], remainderCents: number): number[] => {
  const randomIndices = [...Array(baseCents.length).keys()]
    .sort(() => Math.random() - 0.5)
    .slice(0, remainderCents);

  return baseCents.map((cents, index) => cents + (randomIndices.includes(index) ? 1 : 0));
};

export const calculateSplitsForAPI = (
  config: SplitConfiguration,
  totalAmount: number
): SplitResult[] => {
  const splits: { [userId: number]: number } = {};
  const totalCents = Math.round(totalAmount * 100);

  switch (config.type) {
    case 'equal': {
      const baseCents = Math.floor(totalCents / config.members.length);
      const remainder = totalCents - baseCents * config.members.length;
      const memberCents = distributeRemainder(
        Array(config.members.length).fill(baseCents),
        remainder
      );

      config.members.forEach((member, index) => {
        splits[member.user_id] = memberCents[index] / 100;
      });
      break;
    }

    case 'percentage': {
      const baseCents = config.members.map(member =>
        Math.floor((totalCents * (member.value || 0)) / 100)
      );
      const allocated = baseCents.reduce((sum, cents) => sum + cents, 0);
      const remainder = totalCents - allocated;
      const memberCents = distributeRemainder(baseCents, remainder);

      config.members.forEach((member, index) => {
        splits[member.user_id] = memberCents[index] / 100;
      });
      break;
    }

    case 'fixed':
      config.members.forEach(member => {
        splits[member.user_id] = member.value || 0;
      });
      break;

    case 'parts': {
      const totalParts = config.members.reduce((sum, member) => sum + (member.value || 0), 0);
      if (totalParts === 0) break;

      let allocated = 0;
      const memberCents = config.members.map(member => {
        const cents = Math.floor((totalCents * (member.value || 0)) / totalParts);
        allocated += cents;
        return cents;
      });

      const remainder = totalCents - allocated;
      if (memberCents.length > 0) {
        memberCents[memberCents.length - 1] += remainder;
      }

      config.members.forEach((member, index) => {
        splits[member.user_id] = memberCents[index] / 100;
      });
      break;
    }

    case 'plus_minus': {
      const totalAdjustments = config.members.reduce((sum, member) => sum + (member.value || 0), 0);
      const adjustmentCents = Math.round(totalAdjustments * 100);
      const remainingCents = totalCents - adjustmentCents;
      const baseCents = Math.floor(remainingCents / config.members.length);
      const remainder = remainingCents - baseCents * config.members.length;

      const equalCents = distributeRemainder(
        Array(config.members.length).fill(baseCents),
        remainder
      );

      config.members.forEach((member, index) => {
        const adjustmentCents = Math.round((member.value || 0) * 100);
        splits[member.user_id] = (equalCents[index] + adjustmentCents) / 100;
      });
      break;
    }
  }

  return Object.entries(splits)
    .filter(([user_id, amount]) => amount > 0)
    .map(([user_id, amount]) => ({
      user_id: parseInt(user_id),
      amount: amount.toFixed(2)
    }));
};

const hasNegativeValues = (members: SplitMember[]): boolean =>
  members.some(member => (member.value || 0) < 0);

const getTotalValue = (members: SplitMember[]): number =>
  members.reduce((sum, member) => sum + (member.value || 0), 0);

export const validateSplitConfiguration = (config: SplitConfiguration, totalAmount: number) => {
  const validations = {
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[]
  };

  // Basic validation
  if (config.members.length === 0) {
    validations.isValid = false;
    validations.errors.push('At least one member must be selected');
    return validations;
  }

  const hasEmptyValues = config.members.some(
    member => member.value === undefined || member.value === null || isNaN(member.value)
  );

  if (hasEmptyValues) {
    validations.isValid = false;
    validations.errors.push('Please enter values for all members');
    return validations;
  }

  // Type-specific validation
  switch (config.type) {
    case 'percentage': {
      const totalPercentage = getTotalValue(config.members);

      if (hasNegativeValues(config.members)) {
        validations.isValid = false;
        validations.errors.push('Percentages cannot be negative');
      }

      if (Math.abs(totalPercentage - 100) > 0.01) {
        validations.isValid = false;
        validations.errors.push(
          `Percentages must add up to 100% (currently ${totalPercentage.toFixed(1)}%)`
        );
      }
      break;
    }

    case 'fixed': {
      const totalFixed = getTotalValue(config.members);

      if (hasNegativeValues(config.members)) {
        validations.isValid = false;
        validations.errors.push('Fixed amounts cannot be negative');
      }

      if (Math.abs(totalFixed - totalAmount) >= 0.009) {
        validations.isValid = false;
        validations.errors.push(
          `Fixed amounts ($${totalFixed.toFixed(2)}) don't match expense total ($${totalAmount.toFixed(2)}).`
        );
      }
      break;
    }

    case 'parts': {
      const totalParts = getTotalValue(config.members);

      if (hasNegativeValues(config.members)) {
        validations.isValid = false;
        validations.errors.push('Parts cannot be negative');
      }

      if (totalParts === 0) {
        validations.isValid = false;
        validations.errors.push('Total parts must be greater than 0');
      }
      break;
    }

    case 'plus_minus': {
      const totalAdjustments = getTotalValue(config.members);

      if (Math.abs(totalAdjustments) > totalAmount) {
        validations.isValid = false;
        validations.errors.push(
          `Total adjustments ($${totalAdjustments.toFixed(2)}) exceed expense total ($${totalAmount.toFixed(2)}).`
        );
      }
      break;
    }
  }

  return validations;
};
