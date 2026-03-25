import React from 'react';
import { View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
}

export function ScreenWrapper({ children, className = '', ...props }: ScreenWrapperProps) {
  return (
    <SafeAreaView
      className={`flex-1 bg-background dark:bg-background-dark ${className}`}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
}
