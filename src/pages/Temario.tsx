import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BookOpen, Search, ChevronDown, ChevronUp, 
  Book, PenTool, Beaker, Calculator, Brain, Globe, 
  Map, Atom, MessageSquare, Shield, FolderOpen, ChevronRight, Moon, Sun, ArrowUp, Loader2
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_AI_KNOWLEDGE } from '../data/defaultAiKnowledge';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Definition of interfaces for our parsed structure
interface Topic {
  id: string;
  name: string;
  tags: string[];
  subtopics: string[];
}

interface Course {
  id: string;
  name: string;
  category?: string;
  topics: Topic[];
  icon: React.ReactNode;
}

interface Cycle {
  id: string;
  name: string;
  price: string;
  courses: Course[];
}

// Function to map course names to icons
const getCourseIcon = (courseName: string): React.ReactNode => {
  const nameL = courseName.toLowerCase();
  
  if (nameL.includes('anato') || nameL.includes('fisiolog') || nameL.includes('biolo')) return <Atom className="w-5 h-5 text-green-500" />;
  if (nameL.includes('mate') || nameL.includes('aritm') || nameL.includes('geom') || nameL.includes('trigo') || nameL.includes('raz mat') || nameL.includes('razonamiento matem')) return <Calculator className="w-5 h-5 text-blue-500" />;
  if (nameL.includes('físic') || nameL.includes('químic')) return <Beaker className="w-5 h-5 text-purple-500" />;
  if (nameL.includes('lengu') || nameL.includes('raz verbal') || nameL.includes('razonamiento verbal') || nameL.includes('literat') || nameL.includes('inglés')) return <MessageSquare className="w-5 h-5 text-orange-500" />;
  if (nameL.includes('histo') || nameL.includes('filos') || nameL.includes('cívica')) return <Book className="w-5 h-5 text-amber-600" />;
  if (nameL.includes('geograf')) return <Globe className="w-5 h-5 text-teal-500" />;
  if (nameL.includes('psico') || nameL.includes('lógic')) return <Brain className="w-5 h-5 text-pink-500" />;
  
  return <FolderOpen className="w-5 h-5 text-gray-500" />;
};

// Color mapping for tags
const getTagColor = (tag: string) => {
  switch (tag.toLowerCase()) {
    case 'teoría': return 'bg-blue-600 text-white font-bold dark:bg-blue-600 shadow-sm border border-transparent';
    case 'práctica': return 'bg-green-600 text-white font-bold dark:bg-green-600 shadow-sm border border-transparent';
    case 'folleto': return 'bg-purple-600 text-white font-bold dark:bg-purple-600 shadow-sm border border-transparent';
    case 'material': return 'bg-orange-600 text-white font-bold dark:bg-orange-600 shadow-sm border border-transparent';
    default: return 'bg-slate-600 text-white font-bold dark:bg-slate-600 shadow-sm border border-transparent';
  }
};

// Parser
const parseKnowledge = (markdown: string): Cycle[] => {
  const lines = markdown.split('\n');
  const cycles: Cycle[] = [];
  let currentCycle: Cycle | null = null;
  let currentCourse: Course | null = null;
  let currentTopic: Topic | null = null;
  let categoryPrefix = '';

  // Helper to format course names and capitalize
    const formatCourseName = (name: string): string => {
    let lowerObj = name.toLowerCase();
    
    if (lowerObj === 'anato 1') return 'Anatomía Fisiología 1';
    if (lowerObj === 'anato 2') return 'Anatomía Fisiología 2';
    if (lowerObj === 'anatomía') return 'Anatomía y Fisiología';
    if (lowerObj === 'raz mat' || lowerObj === 'raz matemático') return 'Razonamiento Matemático';
    if (lowerObj === 'raz verbal') return 'Razonamiento Verbal';
    if (lowerObj === 'raz verbal 1') return 'Razonamiento Verbal 1';
    if (lowerObj === 'raz verbal 2') return 'Razonamiento Verbal 2';
    if (lowerObj === 'mates 1') return 'Matemáticas 1';
    if (lowerObj === 'mates 2') return 'Matemáticas 2';

    return name;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines or specific separators
    if (!line.trim() || line.startsWith('---') || line.startsWith('# PRECIOS') || line.startsWith('# CATÁLOGO')) {
      continue;
    }

    // Skip price list bullet points at the very top (before any cycle begins)
    if (!currentCycle && !line.startsWith('## ')) {
      continue;
    }

    if (line.startsWith('## ')) {
      const rawName = line.replace('## ', '').trim();
      const matchPrice = rawName.match(/\((S\/\.\d+)\)/);
      const price = matchPrice ? matchPrice[1] : '';
      const name = rawName.replace(/\(S\/\.\d+\)/, '').trim().toUpperCase();
      
      currentCycle = { id: `cycle-${i}`, name, price, courses: [] };
      cycles.push(currentCycle);
      currentCourse = null;
      currentTopic = null;
      categoryPrefix = '';
    } else if (line.startsWith('### ')) {
      if (currentCycle) {
        const name = formatCourseName(line.replace('### ', '').trim()).toUpperCase();
        categoryPrefix = name;
        currentCourse = { id: `course-${i}`, name, topics: [], icon: getCourseIcon(name) };
        currentCycle.courses.push(currentCourse);
        currentTopic = null;
      }
    } else if (line.startsWith('#### ')) {
      if (currentCycle) {
        let subName = formatCourseName(line.replace('#### ', '').trim()).toUpperCase();
        
        // If the last added course has NO topics, it was just a category placeholder.
        // We remove it from the array.
        if (currentCycle.courses.length > 0) {
          const lastCourse = currentCycle.courses[currentCycle.courses.length - 1];
          if (lastCourse.topics.length === 0 && lastCourse.name === categoryPrefix) {
            currentCycle.courses.pop();
          }
        }
        
        currentCourse = { id: `course-${i}`, name: subName, category: categoryPrefix, topics: [], icon: getCourseIcon(subName) };
        currentCycle.courses.push(currentCourse);
        currentTopic = null;
      }
    } else if (line.startsWith('- ')) {
      if (!currentCourse && currentCycle) {
        currentCourse = { id: `course-${i}-general`, name: 'Contenido', topics: [], icon: <Book className="w-5 h-5 text-gray-500" /> };
        currentCycle.courses.push(currentCourse);
      }

      if (currentCourse) {
        let name = line.replace('- ', '').trim();
        const tags: string[] = [];
        
        // Extract tags like [Teoría], [Práctica]
        const tagRegex = /\[(.*?)\]/g;
        let match;
        while ((match = tagRegex.exec(name)) !== null) {
          tags.push(match[1]);
        }
        name = name.replace(/\[.*?\]/g, '').trim();

        currentTopic = { id: `topic-${i}`, name, tags, subtopics: [] };
        currentCourse.topics.push(currentTopic);
      }
    } else if (line.startsWith('  - ')) {
      if (currentTopic) {
        let name = line.replace('  - ', '').trim();
        // Remove tags from subtopic string if any, though usually none
        currentTopic.subtopics.push(name);
      }
    }
  }
  return cycles;
};

// Recursive components
const TopicRow = ({ topic }: { topic: Topic }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubtopics = topic.subtopics.length > 0;

  return (
    <div className="py-2 pl-4">
      <div 
        className={`flex flex-wrap items-center gap-2 ${hasSubtopics ? 'cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-800/50 p-2 -ml-2 rounded-lg transition-colors select-none' : 'p-2 -ml-2'}`}
        onClick={() => hasSubtopics && setIsExpanded(!isExpanded)}
      >
        {hasSubtopics ? (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 text-cyan-600 dark:text-[var(--color-brand-cyan)] shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          )
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-cyan)]/50 shrink-0 ml-1.5"></span>
        )}
        
        <span className={`text-sm font-medium leading-tight ${hasSubtopics ? 'text-[var(--color-brand-cyan)]' : 'text-[var(--color-text-main)]'}`}>
          {topic.name}
        </span>
        
        {topic.tags.map(tag => (
          <span 
            key={tag} 
            className={`text-[10px] px-1.5 py-0.5 rounded-md border font-semibold tracking-wide uppercase ${getTagColor(tag)}`}
          >
            {tag}
          </span>
        ))}
        
        {hasSubtopics && (
          <span className="text-xs font-bold text-white bg-slate-600 dark:bg-slate-600 px-2 py-0.5 rounded-full ml-auto shadow-sm border border-transparent">
            {topic.subtopics.length} subtemas
          </span>
        )}
      </div>
      
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        {hasSubtopics && (
          <ul className="mt-1 mb-2 pl-6 border-l-2 border-gray-100 dark:border-gray-800 ml-2 space-y-2">
            {topic.subtopics.map((sub, idx) => (
              <li key={idx} className="text-sm text-[var(--color-text-muted)] flex items-start gap-2 pt-1 transition-colors hover:text-[var(--color-text-main)]">
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0 mt-2"></span>
                <span className="leading-tight">{sub}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const getCategoryIcon = (category: string) => {
  const nameL = category.toLowerCase();
  if (nameL.includes('biomédicas') || nameL.includes('biomedica')) return <Atom className="w-5 h-5" />;
  if (nameL.includes('ingenierías') || nameL.includes('ingenieria')) return <Calculator className="w-5 h-5" />;
  if (nameL.includes('sociales')) return <Globe className="w-5 h-5" />;
  return <FolderOpen className="w-5 h-5" />;
};

const CourseAccordion = ({ course, cycleName, isExpanded, onToggle }: { course: Course, cycleName: string, isExpanded: boolean, onToggle: () => void }) => {
  const isExamenes = cycleName.toLowerCase().includes('exámenes');
  const isTomos = cycleName.toLowerCase().includes('tomos');
  let label = "temas";
  if (isExamenes) label = "exámenes";
  if (isTomos) label = "cursos";

  return (
    <div className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-bg-card)] transition-all hover:border-[var(--color-brand-cyan)]/50 shadow-sm">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 dark:hover:bg-[#1a2133]/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--color-bg-card)] rounded-lg shadow-sm border border-[var(--color-border)]">
            {course.icon}
          </div>
          <span className="font-semibold text-[var(--color-text-main)]">{course.name}</span>
          <span className="text-xs font-bold text-white bg-cyan-600 dark:bg-cyan-600 border border-transparent shadow-sm px-2 py-0.5 rounded-full">
            {course.topics.length} {label}
          </span>
        </div>
        <div className="text-[var(--color-text-muted)]">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>
      
      {isExpanded && (
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {course.topics.map(topic => (
              <TopicRow key={topic.id} topic={topic} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CycleSection = ({ cycle, defaultExpanded = false }: { cycle: Cycle, defaultExpanded?: boolean }) => {
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Group courses by category
  const groupedCourses = useMemo(() => {
    const groups: { category: string; courses: Course[] }[] = [];
    const noCategory: Course[] = [];
    const categoryMap: Record<string, Course[]> = {};

    cycle.courses.forEach(course => {
      if (course.category) {
        if (!categoryMap[course.category]) {
          categoryMap[course.category] = [];
          groups.push({ category: course.category, courses: categoryMap[course.category] });
        }
        categoryMap[course.category].push(course);
      } else {
        noCategory.push(course);
      }
    });

    return { groups, noCategory };
  }, [cycle.courses]);

  const [isCycleExpanded, setIsCycleExpanded] = useState(defaultExpanded);

  // Sync with defaultExpanded if it changes (e.g. searching)
  React.useEffect(() => {
    setIsCycleExpanded(defaultExpanded);
  }, [defaultExpanded]);

  return (
    <div id={cycle.id} className="mb-6 scroll-mt-24 border-2 border-[var(--color-border)] rounded-2xl overflow-hidden bg-[var(--color-bg-card)] shadow-sm">
      <button 
        onClick={() => setIsCycleExpanded(!isCycleExpanded)}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-[var(--color-brand-bg)] hover:bg-[var(--color-border)]/30 transition-colors text-left"
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="p-3 bg-[var(--color-brand-cyan)] text-white rounded-xl shadow-sm">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-main)] uppercase tracking-wide flex items-center gap-2 flex-wrap">
            {cycle.name}
            {cycle.name.toLowerCase().includes('resúmenes') && (
              <span className="inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs sm:text-sm font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Aún en proceso
              </span>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {cycle.price && (
            <div className="bg-white dark:bg-gray-800 text-[var(--color-brand-cyan)] border border-[var(--color-brand-cyan)] px-4 py-1.5 rounded-full font-bold text-sm shadow-sm whitespace-nowrap">
              {cycle.price}
            </div>
          )}
          <div className="text-[var(--color-brand-cyan)] p-2 rounded-full border-2 border-[var(--color-border)] bg-gray-50 dark:bg-gray-800">
            {isCycleExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {isCycleExpanded && (
        <div className="p-4 sm:p-6 flex flex-col gap-3 border-t border-[var(--color-border)]">
          {groupedCourses.groups.map(group => (
          <div key={group.category} className="border-2 border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-bg-main)] shadow-sm">
            <button
              onClick={() => toggleCategory(group.category)}
              className="w-full flex items-center justify-between p-4 bg-[var(--color-brand-bg)] hover:bg-[var(--color-border)]/30 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-brand-cyan)] text-white rounded-lg shadow-sm">
                  {getCategoryIcon(group.category)}
                </div>
                <span className="font-bold text-lg text-[var(--color-text-main)]">{group.category}</span>
                <span className="text-xs font-bold text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border)] px-2 py-0.5 rounded-full">
                  {group.courses.length} cursos
                </span>
              </div>
              <div className="text-[var(--color-brand-cyan)]">
                {expandedCategories[group.category] || defaultExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
              </div>
            </button>
            
            {(expandedCategories[group.category] || defaultExpanded) && (
              <div className="p-4 flex flex-col gap-3 border-t border-[var(--color-border)]/50">
                {group.courses.map(course => (
                  <CourseAccordion 
                    key={course.id} 
                    course={course} 
                    cycleName={cycle.name}
                    isExpanded={!!expandedCourses[course.id] || defaultExpanded}
                    onToggle={() => toggleCourse(course.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {groupedCourses.noCategory.map(course => (
          <CourseAccordion 
            key={course.id} 
            course={course} 
            cycleName={cycle.name}
            isExpanded={!!expandedCourses[course.id] || defaultExpanded}
            onToggle={() => toggleCourse(course.id)}
          />
        ))}

        {cycle.courses.length === 0 && (
          <div className="text-[var(--color-text-muted)] text-center py-6 bg-[var(--color-bg-card)] rounded-xl border border-dashed border-[var(--color-border)] opacity-70">
            No hay cursos detallados para este ciclo.
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export const Temario: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [knowledgeText, setKnowledgeText] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const docRef = doc(db, 'settings', 'ai_knowledge');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().content) {
          setKnowledgeText(docSnap.data().content);
        } else {
          setKnowledgeText(DEFAULT_AI_KNOWLEDGE);
        }
      } catch (error) {
        console.error("Error fetching knowledge:", error);
        setKnowledgeText(DEFAULT_AI_KNOWLEDGE);
      } finally {
        setLoading(false);
      }
    };
    fetchKnowledge();
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const cycles = useMemo(() => {
    if (!knowledgeText) return [];
    return parseKnowledge(knowledgeText);
  }, [knowledgeText]);

  const filteredCycles = useMemo(() => {
    if (!searchTerm.trim()) return cycles;
    
    const lowerSearch = searchTerm.toLowerCase();
    
    return cycles.map(cycle => {
      // Si el ciclo coincide, mostramos todo
      if (cycle.name.toLowerCase().includes(lowerSearch)) return cycle;
      
      const filteredCourses = cycle.courses.map(course => {
        const categoryMatch = course.category && course.category.toLowerCase().includes(lowerSearch);
        // Si el curso o la categoria coincide, mostramos todos sus temas
        if (course.name.toLowerCase().includes(lowerSearch) || categoryMatch) return course;
        
        // Si no, filtramos temas y subtemas
        const filteredTopics = course.topics.filter(topic => 
          topic.name.toLowerCase().includes(lowerSearch) ||
          topic.tags.some(tag => tag.toLowerCase().includes(lowerSearch)) ||
          topic.subtopics.some(sub => sub.toLowerCase().includes(lowerSearch))
        );
        
        if (filteredTopics.length > 0) {
          return { ...course, topics: filteredTopics };
        }
        return null;
      }).filter(course => course !== null) as Course[];
      
      return { ...cycle, courses: filteredCourses };
    }).filter(cycle => cycle.courses.length > 0);
  }, [cycles, searchTerm]);

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8 relative text-[var(--color-text-main)]">
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-full hover:bg-[var(--color-brand-cyan)] hover:bg-opacity-10 transition-colors bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">Volver</span>
        </button>
      </div>

      <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
        <button
          onClick={toggleTheme}
          className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] rounded-full hover:bg-[var(--color-brand-cyan)] hover:bg-opacity-10 transition-colors bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-sm"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          <span className="hidden sm:inline font-medium">Tema</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto pt-10 sm:pt-0">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-[var(--color-brand-cyan)]/10 to-purple-500/10 text-[var(--color-brand-cyan)] rounded-2xl mb-6 shadow-sm border border-[var(--color-brand-cyan)]/20">
            <BookOpen className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text-main)] sm:text-5xl tracking-tight mb-4">
            Catálogo de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-cyan)] to-[var(--color-brand-deep)] dark:to-purple-500">Contenidos</span>
          </h1>
          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
            Explora todos los temas, subtemas y materiales disponibles organizados por ciclos y cursos.
          </p>
        </div>

        <div className={`max-w-2xl mx-auto mb-10 sticky top-4 z-10 transition-opacity duration-300 ${showScrollTop ? 'opacity-60 hover:opacity-100 focus-within:opacity-100' : 'opacity-100'}`}>
          <div className="relative group shadow-lg rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[var(--color-brand-cyan)] transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Buscar curso, tema, etiqueta (ej. Biología, Teoría, Vectores)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-[var(--color-bg-card)] border-2 border-[var(--color-border)] rounded-2xl focus:border-[var(--color-brand-cyan)] text-[var(--color-text-main)] placeholder-gray-400 focus:outline-none focus:ring-0 transition-all shadow-sm text-sm sm:text-base outline-none"
            />
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  onClick={() => setSearchTerm('')}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 rotate-180 opacity-0" /> {/* Spacer */}
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold bg-gray-200 dark:bg-gray-700 rounded-full w-5 h-5 m-auto">✕</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Quick Navigation Chips */}
          {!searchTerm && cycles.length > 0 && (
            <div className={`mt-4 flex flex-wrap justify-center gap-2 overflow-hidden transition-all duration-300 ease-in-out ${showScrollTop ? 'max-h-0 opacity-0 m-0' : 'max-h-96 opacity-100'}`}>
              {cycles.map(cycle => (
                <button
                  key={`nav-${cycle.id}`}
                  onClick={() => {
                    const el = document.getElementById(cycle.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs font-bold px-3 py-1.5 rounded-full bg-[var(--color-bg-card)] border-2 border-[var(--color-border)] text-[var(--color-text-main)] hover:border-[var(--color-brand-cyan)] hover:text-[var(--color-brand-cyan)] transition-colors shadow-sm"
                >
                  {cycle.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col flex-1 items-center justify-center p-12 mt-8">
              <Loader2 className="w-12 h-12 text-[var(--color-brand-cyan)] animate-spin mb-4" />
              <p className="text-[var(--color-text-muted)] font-medium">Cargando catálogo...</p>
            </div>
          ) : filteredCycles.length === 0 ? (
            <div className="text-center py-20 bg-[var(--color-bg-card)] rounded-3xl border border-[var(--color-border)] shadow-sm">
              <div className="bg-[var(--color-brand-bg)] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-border)]/50">
                <Search className="w-10 h-10 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-text-main)] mb-2">No se encontraron resultados</h3>
              <p className="text-[var(--color-text-muted)] max-w-md mx-auto">
                No pudimos encontrar ningún curso o tema que coincida con "{searchTerm}". Intenta con otros términos.
              </p>
            </div>
          ) : (
            filteredCycles.map(cycle => (
              <CycleSection 
                key={cycle.id} 
                cycle={cycle} 
                defaultExpanded={searchTerm.length > 0} 
              />
            ))
          )}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-[var(--color-brand-cyan)] hover:bg-[var(--color-brand-deep)] text-white rounded-full shadow-lg transition-all hover:scale-110 z-50 flex items-center justify-center"
          title="Volver arriba"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

