"use client";

import { useState } from 'react';
import { Github, BookOpen, Target, Code, FileText, GitBranch, Star, Users, ExternalLink, Clock, CheckCircle, Circle, Play, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isValidGitHubUrl, extractRepoInfo } from '@/lib/utils';

interface LanguageDistribution {
  language: string;
  percentage: number;
  bytes: number;
}

interface RepoInfo {
  name: string;
  owner: string;
  description: string;
  language: string;
  secondaryLanguages?: string[];
  isMultiLanguage?: boolean;
  languageDistribution?: LanguageDistribution[];
  stars: number;
  forks: number;
  topics: string[];
  url: string;
  size: number;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  openIssues: number;
  contributors: number;
  hasWiki: boolean;
  hasPages: boolean;
}

interface LearningTask {
  id: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  type: 'reading' | 'coding' | 'practice';
  resources: string[];
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [learningTasks, setLearningTasks] = useState<LearningTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'tasks'>('overview');

  const analyzeLearningPath = async () => {
    if (!isValidGitHubUrl(repoUrl)) {
      setError('请输入有效的 GitHub 仓库 URL');
      return;
    }

    const repoData = extractRepoInfo(repoUrl);
    if (!repoData) {
      setError('无法解析 GitHub 仓库信息');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '分析失败');
      }

      const data = await response.json();
      setRepoInfo(data.repoInfo);
      setLearningTasks(data.learningTasks);
      setCompletedTasks(new Set());
      setActiveTab('overview');
    } catch (err: any) {
      setError(err.message || '分析失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = (taskId: number) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reading': return <FileText className="w-4 h-4" />;
      case 'coding': return <Code className="w-4 h-4" />;
      case 'practice': return <Target className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'reading': return '阅读学习';
      case 'coding': return '编码实践';
      case 'practice': return '动手练习';
      default: return '学习';
    }
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'Python': 'bg-blue-500',
      'JavaScript': 'bg-yellow-500',
      'TypeScript': 'bg-blue-600',
      'Java': 'bg-orange-500',
      'C++': 'bg-blue-700',
      'C': 'bg-gray-600',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-600',
      'Swift': 'bg-orange-400',
      'Kotlin': 'bg-purple-500',
      'Ruby': 'bg-red-500',
      'PHP': 'bg-purple-600',
      'C#': 'bg-green-600',
      'R': 'bg-blue-400',
      'HTML': 'bg-orange-600',
      'CSS': 'bg-blue-600',
      'Shell': 'bg-gray-500',
      'Dockerfile': 'bg-blue-800'
    };
    return colors[language] || 'bg-gray-400';
  };

  const totalTasks = learningTasks.length;
  const completedCount = completedTasks.size;
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const generateProjectSummary = (repoInfo: RepoInfo) => {
    const complexity = repoInfo.size > 10000 ? '高级' : repoInfo.size > 1000 ? '中级' : '初级';
    const communitySize = repoInfo.contributors > 100 ? '大型' : repoInfo.contributors > 10 ? '中型' : '小型';
    
    let languageDescription = `使用 ${repoInfo.language} 开发`;
    if (repoInfo.isMultiLanguage && repoInfo.secondaryLanguages && repoInfo.secondaryLanguages.length > 0) {
      languageDescription += `，同时结合 ${repoInfo.secondaryLanguages.slice(0, 2).join('、')} 等多种技术`;
    }
    
    return `${repoInfo.name} 是一个${languageDescription}的${complexity}项目，拥有 ${repoInfo.stars.toLocaleString()} 个星标和 ${repoInfo.contributors} 个贡献者，属于${communitySize}开源社区项目。该项目${repoInfo.description ? '专注于' + repoInfo.description.toLowerCase() : '提供了丰富的功能和特性'}。通过学习此项目，您将掌握${repoInfo.isMultiLanguage ? '多语言开发、' : ''}${repoInfo.language} 的最佳实践、项目架构设计和开源协作流程。`;
  };

  // 预设的优秀AI Agent项目
  const aiAgentProjects = [
    'https://github.com/openai/gym',
    'https://github.com/ray-project/ray',
    'https://github.com/deepmind/lab',
    'https://github.com/Unity-Technologies/ml-agents',
    'https://github.com/deepmind/pysc2',
    'https://github.com/tensorflow/agents',
    'https://github.com/openai/spinningup',
    'https://github.com/openai/multiagent-particle-envs'
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 头部导航 */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Github className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold">LearnGitHub</h1>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700">
                <BookOpen className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700">
                <Target className="w-4 h-4 mr-2" />
                Add Repo
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!repoInfo ? (
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <h2 className="text-4xl font-bold mb-4">
                将 GitHub 仓库转换为学习路径
              </h2>
              <p className="text-xl text-gray-400">
                输入任何 GitHub 仓库链接，我们将为您生成个性化的学习任务和路径
              </p>
            </div>

            <Card className="bg-gray-800 border-gray-700 p-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2 text-white">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                  <span>开始您的学习之旅</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  粘贴 GitHub 仓库链接，我们将分析项目并为您生成专属学习计划
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="url"
                    placeholder="https://github.com/vercel/next.js"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="text-lg py-3 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                  {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                  )}
                </div>
                <Button
                  onClick={analyzeLearningPath}
                  disabled={loading || !repoUrl}
                  className="w-full py-3 text-lg bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {loading ? '正在分析...' : '生成学习路径'}
                </Button>
              </CardContent>
            </Card>

            {/* 优秀AI Agent项目推荐 */}
            <div className="mt-8">
              <p className="text-sm text-gray-400 mb-4">优秀的AI Agent开源项目：</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {aiAgentProjects.map((url) => (
                  <Button
                    key={url}
                    variant="outline"
                    size="sm"
                    onClick={() => setRepoUrl(url)}
                    className="text-xs bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 justify-start"
                  >
                    {url.split('/').slice(-2).join('/')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 项目标题区域 */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                <Github className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">关于 {repoInfo.name} 的学习</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                  <span>{repoInfo.owner}</span>
                  <span>•</span>
                  <span className="text-blue-400">{getTypeLabel('reading')}</span>
                  {repoInfo.isMultiLanguage && (
                    <>
                      <span>•</span>
                      <span className="text-purple-400">多语言项目</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 项目视频卡片 */}
            <Card className="bg-gray-800 border-gray-700">
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-blue-900 to-purple-900 rounded-t-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-white mb-4">
                      {repoInfo.name}
                    </div>
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto cursor-pointer hover:bg-red-700 transition-colors">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                    在 GitHub 上查看
                  </div>
                </div>
                <div className="p-4 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <Button
                      variant={activeTab === 'overview' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('overview')}
                      className="bg-gray-700 text-white hover:bg-gray-600"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      内容摘要
                    </Button>
                    <Button
                      variant={activeTab === 'plan' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('plan')}
                      className="bg-gray-700 text-white hover:bg-gray-600"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      操作计划
                    </Button>
                    <Button
                      variant={activeTab === 'tasks' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('tasks')}
                      className="bg-gray-700 text-white hover:bg-gray-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      任务列表
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* 内容区域 */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 左侧主要内容 */}
                <div className="lg:col-span-2 space-y-6">
                  {/* 项目摘要 */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">项目摘要</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 leading-relaxed">
                        {generateProjectSummary(repoInfo)}
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-400">了解更多：</span>
                          <a href={repoInfo.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            {repoInfo.url}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 项目描述 */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">项目描述</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-4">{repoInfo.description || '该项目暂无详细描述'}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-400">主要语言：</span>
                          <span className="text-white ml-2">{repoInfo.language}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Stars：</span>
                          <span className="text-white ml-2">{repoInfo.stars.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Forks：</span>
                          <span className="text-white ml-2">{repoInfo.forks.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">贡献者：</span>
                          <span className="text-white ml-2">{repoInfo.contributors}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Open Issues：</span>
                          <span className="text-white ml-2">{repoInfo.openIssues}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">项目大小：</span>
                          <span className="text-white ml-2">
                            {repoInfo.size > 1000 ? `${Math.round(repoInfo.size / 1000)}MB` : `${repoInfo.size}KB`}
                          </span>
                        </div>
                      </div>

                      {/* 语言分布 */}
                      {repoInfo.languageDistribution && repoInfo.languageDistribution.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <BarChart3 className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-400 text-sm">语言分布：</span>
                          </div>
                          <div className="space-y-2">
                            {repoInfo.languageDistribution.slice(0, 5).map((lang) => (
                              <div key={lang.language} className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${getLanguageColor(lang.language)}`}></div>
                                <span className="text-sm text-gray-300 w-20">{lang.language}</span>
                                <div className="flex-1 bg-gray-700 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${getLanguageColor(lang.language)}`}
                                    style={{ width: `${lang.percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-400 w-10">{lang.percentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {repoInfo.topics && repoInfo.topics.length > 0 && (
                        <div className="mt-4">
                          <span className="text-gray-400 text-sm">标签：</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {repoInfo.topics.slice(0, 8).map((topic) => (
                              <span key={topic} className="px-2 py-1 bg-blue-900 text-blue-200 rounded-full text-xs">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* 右侧学习进度 */}
                <div className="space-y-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">学习进度</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">总任务数</span>
                          <span className="text-2xl font-bold text-white">{totalTasks}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">已完成</span>
                          <span className="text-xl font-semibold text-green-400">{completedCount}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">完成率</span>
                            <span className="text-lg font-semibold text-white">{completionRate}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">项目特性</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {repoInfo.isMultiLanguage && (
                          <div className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-gray-300">多语言项目</span>
                          </div>
                        )}
                        {repoInfo.hasWiki && (
                          <div className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-300">包含 Wiki 文档</span>
                          </div>
                        )}
                        {repoInfo.contributors > 50 && (
                          <div className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-300">活跃社区项目</span>
                          </div>
                        )}
                        {repoInfo.openIssues > 0 && (
                          <div className="flex items-center space-x-2 text-sm">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-gray-300">有待解决的Issues</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">快速操作</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => setActiveTab('plan')}
                        >
                          <Target className="w-4 h-4 mr-2" />
                          查看学习计划
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => setActiveTab('tasks')}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          管理任务
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => window.open(repoInfo.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          访问仓库
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'plan' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">行动计划</CardTitle>
                  <CardDescription className="text-gray-400">
                    按照以下顺序学习，循序渐进掌握 {repoInfo.name} 项目
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {learningTasks.map((task, index) => (
                      <div 
                        key={task.id} 
                        className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                                {getTypeIcon(task.type)}
                                <span>{task.title}</span>
                              </h3>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(task.difficulty)}`}>
                                  {task.difficulty === 'beginner' ? '初级' : 
                                   task.difficulty === 'intermediate' ? '中级' : '高级'}
                                </span>
                                <span className="text-sm text-gray-400 flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{task.estimatedTime}</span>
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-300 mb-3">{task.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {task.resources.map((resource) => (
                                <span key={resource} className="px-2 py-1 bg-gray-600 text-gray-200 rounded text-sm">
                                  {resource}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'tasks' && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">任务列表</CardTitle>
                  <CardDescription className="text-gray-400">
                    勾选完成的任务来跟踪您的学习进度
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {learningTasks.map((task) => (
                      <div 
                        key={task.id}
                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                          completedTasks.has(task.id) 
                            ? 'bg-green-900 border-green-600' 
                            : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => toggleTaskCompletion(task.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {completedTasks.has(task.id) ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`font-medium flex items-center space-x-2 ${
                                completedTasks.has(task.id) ? 'text-green-200 line-through' : 'text-white'
                              }`}>
                                {getTypeIcon(task.type)}
                                <span>{task.title}</span>
                              </h3>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-gray-600 text-gray-200 px-2 py-1 rounded">
                                  {getTypeLabel(task.type)}
                                </span>
                                <span className="text-sm text-gray-400">{task.estimatedTime}</span>
                              </div>
                            </div>
                            <p className={`text-sm ${
                              completedTasks.has(task.id) ? 'text-green-300' : 'text-gray-300'
                            }`}>
                              {task.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 返回按钮 */}
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setRepoInfo(null);
                  setLearningTasks([]);
                  setCompletedTasks(new Set());
                  setRepoUrl('');
                }}
                className="px-8 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                分析新项目
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
