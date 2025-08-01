import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  FileText, 
  Award, 
  Target, 
  Scale, 
  PenTool, 
  Calendar, 
  Brain,
  BarChart3
} from 'lucide-react';

// Usa tu logo existente o esta imagen
const logo = '/lovable-uploads/1a938380-f406-4c24-8abf-67ffe4505203.png';

interface SidebarProps {
  onMenuSelect: (menu: string) => void;
  activeMenu: string;
}

const menuItems = [
  { id: 'test-temas', label: 'Test por temas', icon: BookOpen },
  { id: 'test-bloques-gc', label: 'Test por bloques Guardia Civil', icon: FileText },
  { id: 'test-oficiales', label: 'Hacer test Oficiales', icon: Award },
  { id: 'simulacros', label: 'Simulacros', icon: Target },
  { id: 'test-leyes', label: 'Test por Leyes', icon: Scale },
  { id: 'ejercicios', label: 'Ejercicios prácticos', icon: PenTool },
  { id: 'calendario', label: 'Calendario', icon: Calendar },
  { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
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