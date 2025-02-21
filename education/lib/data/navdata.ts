import { Home, Users, Calendar, BarChart2, Settings, LogOut, Notebook, Clock, CheckCheck } from 'lucide-react';

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
    name: 'Classes',
    href: '/main/student/classes',
    icon: BarChart2
  },
  {
    name: 'Classroom',
    href: '/main/student/classroom',
    icon: Users
  },
  {
    name: 'Guidance',
    href: '/main/student/guidance',
    icon: Calendar
  },
  {
    name:'Lecture',
    href:'/main/student/Lecture',
    icon: Notebook
  },
  {
    name:'Routine',
    href:'/main/student/Routine',
    icon: Clock
  },
  {
    name:'Debate',
    href:'/main/student/Debate',
    icon: CheckCheck
  }
];
