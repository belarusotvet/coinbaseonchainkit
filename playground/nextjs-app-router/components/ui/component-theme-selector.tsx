import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Car, Circle, Sparkles, Sun } from 'lucide-react';
import type React from 'react';
import { useContext } from 'react';
import { AppContext } from '../AppProvider';
import type { ComponentTheme as ComponentThemeType } from '../AppProvider';

type Theme = {
  name: ComponentThemeType;
  icon: React.ReactNode;
  primaryColor: string;
  iconColor: string;
};

const themes: Theme[] = [
  {
    name: 'default',
    icon: <Sun className="h-3 w-3" />,
    primaryColor: '#f8fafc',
    iconColor: '#1e293b',
  },
  {
    name: 'base',
    icon: <Circle className="h-3 w-3" />,
    primaryColor: '#0052ff',
    iconColor: '#f8fafc',
  },
  {
    name: 'cyberpunk',
    icon: <Car className="h-3 w-3" />,
    primaryColor: '#E879F9',
    iconColor: '#ffffff',
  },
  {
    name: 'minimal',
    icon: <Sparkles className="h-3 w-3" />,
    primaryColor: '#18181b',
    iconColor: '#22d3ee',
  },
];

export default function ComponentThemeSelector() {
  const { componentTheme, setComponentTheme } = useContext(AppContext);

  const handleThemeChange = (theme: Theme) => {
    setComponentTheme(theme.name);
    console.log(`Applied theme: ${theme.name}`);
  };

  return (
    <TooltipProvider>
      <div className="-translate-y-1/2 fixed top-1/2 right-4 z-50 transform">
        <div className="relative h-40 w-10 overflow-hidden rounded-full bg-background shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-background" />
          <div className="relative flex h-full flex-col items-center justify-center space-y-3">
            {themes.map((theme) => (
              <Tooltip key={theme.name}>
                <TooltipTrigger asChild={true}>
                  <button
                    type="button"
                    onClick={() => handleThemeChange(theme)}
                    className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                      componentTheme === theme.name
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                        : ''
                    }`}
                    style={{ backgroundColor: theme.primaryColor }}
                    aria-label={`Select ${theme.name} theme`}
                  >
                    <span className="sr-only">Select {theme.name} theme</span>
                    <span style={{ color: theme.iconColor }}>{theme.icon}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={16}>
                  <p>{theme.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
