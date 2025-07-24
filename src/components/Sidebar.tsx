import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  FileText, 
  Award, 
  Target, 
  Scale, 
  PenTool, 
  Calendar, 
  Brain 
} from 'lucide-react';
const logo = '/lovable-uploads/e4e7a721-2505-47bc-8d8d-9cb7b8f4ebb7.png';

interface SidebarProps {
  onMenuSelect: (menu: string) => void;
  activeMenu: string;
}

const menuItems = [
  { id: 'test-temas', label: 'Test por temas', icon: BookOpen },
  { id: 'test-bloques', label: 'Hacer test por bloques', icon: FileText },
  { id: 'test-oficiales', label: 'Hacer test Oficiales', icon: Award },
  { id: 'simulacros', label: 'Simulacros', icon: Target },
  { id: 'test-leyes', label: 'Test por Leyes', icon: Scale },
  { id: 'ejercicios', label: 'Ejercicios prácticos', icon: PenTool },
  { id: 'calendario', label: 'Calendario', icon: Calendar },
  { id: 'mentor-ia', label: 'Mentor IA', icon: Brain },
];

export const Sidebar = ({ onMenuSelect, activeMenu }: SidebarProps) => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 flex justify-center">
        <img src={logo} alt="Logo" className="w-48 h-auto" />
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeMenu === item.id ? "default" : "ghost"}
              className="w-full justify-start gap-3 h-12 text-sm font-medium"
              onClick={() => onMenuSelect(item.id)}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};