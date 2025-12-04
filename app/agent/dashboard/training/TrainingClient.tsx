'use client';

import { useState, useTransition } from 'react';
import {
  Plus, Search, Play, CheckCircle, Clock, BookOpen,
  Video, Award, X, ChevronRight, BarChart3, FileText,
  Users, Shield, GraduationCap, Briefcase
} from 'lucide-react';
import {
  startModule,
  completeModule,
  submitQuiz,
} from './actions';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  content: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  category: string;
  order: number;
  hasQuiz: boolean;
  quizQuestions: QuizQuestion[] | null;
  passingScore: number | null;
  isSystem: boolean;
  completion: {
    status: string;
    progress: number;
    quizScore: number | null;
    quizAttempts: number;
    completedAt: string | null;
  } | null;
  createdAt: string;
}

interface Stats {
  totalModules: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  totalDuration: number;
  completedDuration: number;
}

interface TrainingClientProps {
  modules: Module[];
  stats: Stats;
  overallProgress: number;
  isManager: boolean;
}

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  ONBOARDING: { label: 'Getting Started', icon: <Play className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
  PRODUCT_KNOWLEDGE: { label: 'Product Knowledge', icon: <BookOpen className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700' },
  SALES_SKILLS: { label: 'Sales Skills', icon: <Briefcase className="w-4 h-4" />, color: 'bg-green-100 text-green-700' },
  COMPLIANCE: { label: 'Compliance', icon: <Shield className="w-4 h-4" />, color: 'bg-red-100 text-red-700' },
  SYSTEM_TRAINING: { label: 'System Training', icon: <BarChart3 className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700' },
  RECRUITING: { label: 'Recruiting', icon: <Users className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-700' },
  LEADERSHIP: { label: 'Leadership', icon: <Award className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-700' },
};

export default function TrainingClient({ modules, stats, overallProgress, isManager }: TrainingClientProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<{
    score: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter modules
  const filteredModules = modules.filter(module => {
    const matchesSearch =
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || module.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Group by category
  const modulesByCategory = filteredModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, Module[]>);

  const handleStartModule = async (module: Module) => {
    startTransition(async () => {
      await startModule(module.id);
      setSelectedModule(module);
    });
  };

  const handleCompleteModule = async () => {
    if (!selectedModule) return;

    if (selectedModule.hasQuiz && !selectedModule.completion?.quizScore) {
      setShowQuiz(true);
      return;
    }

    startTransition(async () => {
      await completeModule(selectedModule.id);
      setSelectedModule(null);
    });
  };

  const handleSubmitQuiz = async () => {
    if (!selectedModule) return;

    startTransition(async () => {
      const result = await submitQuiz(selectedModule.id, quizAnswers);
      if (result.success && result.data) {
        setQuizResult(result.data);
        if (result.data.passed) {
          setTimeout(() => {
            setShowQuiz(false);
            setQuizResult(null);
            setQuizAnswers({});
            setSelectedModule(null);
          }, 3000);
        }
      }
    });
  };

  const getStatusBadge = (module: Module) => {
    if (!module.completion) {
      return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">Not Started</span>;
    }
    if (module.completion.status === 'COMPLETED') {
      return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" /> Completed
      </span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
      {module.completion.progress}% Complete
    </span>;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Training Center</h1>
        <p className="text-gray-600">Build your skills and grow your business</p>
      </div>

      {/* Progress Overview */}
      <div className="card-gradient mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Overall Progress</h3>
              <span className="text-2xl font-bold text-blue-600">{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>{stats.completed} of {stats.totalModules} modules completed</span>
              <span>{Math.round(stats.completedDuration / 60)}h of {Math.round(stats.totalDuration / 60)}h watched</span>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-1">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">{stats.completed}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">{stats.inProgress}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                <BookOpen className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">{stats.notStarted}</p>
              <p className="text-xs text-gray-500">Not Started</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-gradient mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center flex-1">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search training..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryConfig).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {isManager && (
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Module
            </button>
          )}
        </div>
      </div>

      {/* Modules by Category */}
      <div className="space-y-6">
        {Object.entries(categoryConfig).map(([categoryKey, config]) => {
          const categoryModules = modulesByCategory[categoryKey] || [];
          if (categoryModules.length === 0) return null;

          return (
            <div key={categoryKey}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`p-2 rounded-lg ${config.color}`}>
                  {config.icon}
                </span>
                <h2 className="font-semibold text-gray-900">{config.label}</h2>
                <span className="text-sm text-gray-500">({categoryModules.length} modules)</span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryModules.map((module) => (
                  <div
                    key={module.id}
                    className="card-gradient hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleStartModule(module)}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                      {module.thumbnailUrl ? (
                        <img src={module.thumbnailUrl} alt={module.title} className="w-full h-full object-cover" />
                      ) : (
                        <Video className="w-12 h-12 text-white/80" />
                      )}
                      {module.videoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                            <Play className="w-6 h-6 text-blue-600 ml-1" />
                          </div>
                        </div>
                      )}
                      {module.duration && (
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {module.duration} min
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <h3 className="font-semibold text-gray-900 mb-1">{module.title}</h3>
                    {module.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{module.description}</p>
                    )}

                    <div className="flex items-center justify-between">
                      {getStatusBadge(module)}
                      {module.hasQuiz && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Quiz
                        </span>
                      )}
                    </div>

                    {module.completion && module.completion.status !== 'COMPLETED' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${module.completion.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="card-gradient text-center py-12">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No training modules found</p>
        </div>
      )}

      {/* Module View Modal */}
      {selectedModule && !showQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedModule.title}</h2>
                {selectedModule.description && (
                  <p className="text-sm text-gray-600 mt-1">{selectedModule.description}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Video */}
              {selectedModule.videoUrl && (
                <div className="aspect-video bg-black rounded-lg mb-6 overflow-hidden">
                  <iframe
                    src={selectedModule.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Content */}
              <div className="prose max-w-none mb-6">
                <div dangerouslySetInnerHTML={{ __html: selectedModule.content }} />
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div>
                  {selectedModule.hasQuiz && !selectedModule.completion?.quizScore && (
                    <p className="text-sm text-gray-600">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Complete the quiz to finish this module
                    </p>
                  )}
                </div>
                <button
                  onClick={handleCompleteModule}
                  disabled={isPending}
                  className="btn-primary flex items-center gap-2"
                >
                  {selectedModule.hasQuiz && !selectedModule.completion?.quizScore ? (
                    <>Take Quiz <ChevronRight className="w-4 h-4" /></>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {isPending ? 'Completing...' : 'Mark Complete'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuiz && selectedModule && selectedModule.quizQuestions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Quiz: {selectedModule.title}</h2>
                <p className="text-sm text-gray-600">
                  Passing score: {selectedModule.passingScore || 70}%
                </p>
              </div>
              <button
                onClick={() => {
                  setShowQuiz(false);
                  setQuizAnswers({});
                  setQuizResult(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {quizResult ? (
                <div className={`text-center p-8 rounded-xl ${quizResult.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    quizResult.passed ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {quizResult.passed ? (
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    ) : (
                      <X className="w-8 h-8 text-red-600" />
                    )}
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${quizResult.passed ? 'text-green-700' : 'text-red-700'}`}>
                    {quizResult.passed ? 'Congratulations!' : 'Not Quite'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You scored {quizResult.score}% ({quizResult.correctCount}/{quizResult.totalQuestions} correct)
                  </p>
                  {!quizResult.passed && (
                    <button
                      onClick={() => {
                        setQuizResult(null);
                        setQuizAnswers({});
                      }}
                      className="btn-primary"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {selectedModule.quizQuestions.map((question, qIndex) => (
                      <div key={qIndex} className="p-4 bg-gray-50 rounded-xl">
                        <p className="font-medium text-gray-900 mb-3">
                          {qIndex + 1}. {question.question}
                        </p>
                        <div className="space-y-2">
                          {question.options.map((option, oIndex) => (
                            <label
                              key={oIndex}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                quizAnswers[qIndex.toString()] === oIndex
                                  ? 'bg-blue-100 border-blue-300 border'
                                  : 'bg-white border border-gray-200 hover:border-blue-200'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${qIndex}`}
                                checked={quizAnswers[qIndex.toString()] === oIndex}
                                onChange={() => setQuizAnswers({ ...quizAnswers, [qIndex.toString()]: oIndex })}
                                className="w-4 h-4 text-blue-600"
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={
                        isPending ||
                        Object.keys(quizAnswers).length !== selectedModule.quizQuestions.length
                      }
                      className="btn-primary"
                    >
                      {isPending ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
