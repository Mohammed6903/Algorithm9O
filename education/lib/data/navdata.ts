import { Home, Users, Calendar, BarChart2, Settings, LogOut, Notebook, Clock, CheckCheck, LucideTableProperties, LucideListChecks } from 'lucide-react';
import { list } from 'postcss';

export const teacherNavItems = [
  {
    name: 'Home',
    href: '/main/teacher',
    icon: Home
  },
  {
    name: 'Quizzes',
    href: '/main/teacher/quizzes',
    icon: BarChart2
  },
  {
    name: 'Subjects',
    href: '/main/teacher/subjects',
    icon: Users
  },
  {
    name: 'Classroom',
    href: '/main/teacher/classroom',
    icon: Calendar
  },
 
];

export const studentNavItems = [
  {
    name: 'Home',
    href: '/main/student',
    icon: Home
  },
  {
    name: 'Summary',
    href: '/main/student/classes',
    icon: LucideTableProperties
  },
  {
    name: 'Classes',
    href: '/main/student/summary',
    icon: BarChart2
  },
  {
    name: 'Guidance',
    href: '/main/student/guidance',
    icon: Calendar
  },
  {
    name:'Routine',
    href:'/main/student/Routine',
    icon: Clock
  },
  {
    name:'Quiz',
    href:'/main/student/quiz',
    icon: LucideListChecks
  },
  {
    name:'Debate',
    href:'/main/student/Debate',
    icon: CheckCheck
  }
];
