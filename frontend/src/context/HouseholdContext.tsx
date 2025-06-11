import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Household } from '../types';

interface HouseholdContextType {
  currentHousehold: Household | null;
  setCurrentHousehold: (household: Household | null) => void;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export const useHousehold = () => {
  const context = useContext(HouseholdContext);

  if (context === undefined) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }

  return context;
};

interface HouseholdProviderProps {
  children: ReactNode;
}

export const HouseholdProvider: React.FC<HouseholdProviderProps> = ({ children }) => {
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);

  const value = {
    currentHousehold,
    setCurrentHousehold
  };

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
};
