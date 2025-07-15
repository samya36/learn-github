import { NextRequest, NextResponse } from 'next/server';

// 配置文件和工具文件的语言类型，这些不应该作为主要语言
const CONFIG_LANGUAGES = new Set([
  'Dockerfile',
  'Shell',
  'PowerShell', 
  'Batchfile',
  'Makefile',
  'JSON',
  'YAML',
  'XML',
  'INI',
  'TOML',
  'Nix',
  'CMake'
]);

// 文档类语言，通常不是主要编程语言
const DOC_LANGUAGES = new Set([
  'Markdown',
  'HTML',
  'CSS',
  'TeX',
  'Rich Text Format'
]);

// 语言权重系数 - 用于调整某些语言的重要性
const LANGUAGE_WEIGHTS = {
  // 主流编程语言 - 高权重
  'Python': 1.2,
  'JavaScript': 1.2,
  'TypeScript': 1.2,
  'Java': 1.2,
  'C++': 1.2,
  'C': 1.2,
  'Go': 1.2,
  'Rust': 1.2,
  'Swift': 1.2,
  'Kotlin': 1.2,
  'Scala': 1.2,
  'Ruby': 1.2,
  'PHP': 1.2,
  'C#': 1.2,
  
  // 脚本和配置语言 - 中等权重
  'R': 1.0,
  'MATLAB': 1.0,
  'Lua': 1.0,
  'Perl': 1.0,
  
  // 前端和样式语言 - 中等权重
  'HTML': 0.8,
  'CSS': 0.7,
  'SCSS': 0.7,
  
  // 配置文件 - 低权重
  'Dockerfile': 0.3,
  'Shell': 0.5,
  'JSON': 0.2,
  'YAML': 0.2,
  'XML': 0.3,
  
  // 文档 - 最低权重
  'Markdown': 0.1,
  'TeX': 0.2
};

function getLanguageWeight(language: string): number {
  return LANGUAGE_WEIGHTS[language] || 1.0;
}

function analyzeLanguages(languages: Record<string, number>) {
  if (!languages || Object.keys(languages).length === 0) {
    return { primary: 'Unknown', secondary: [], isMultiLanguage: false };
  }

  // 计算加权分数
  const weightedLanguages = Object.entries(languages)
    .map(([lang, bytes]) => ({
      language: lang,
      bytes,
      weight: getLanguageWeight(lang),
      weightedScore: bytes * getLanguageWeight(lang),
      isConfig: CONFIG_LANGUAGES.has(lang),
      isDoc: DOC_LANGUAGES.has(lang)
    }))
    .sort((a, b) => b.weightedScore - a.weightedScore);

  // 过滤掉纯配置文件和文档文件后找主要语言
  const programmingLanguages = weightedLanguages.filter(
    item => !item.isConfig && !item.isDoc
  );

  // 如果没有编程语言，回退到所有语言
  const candidateLanguages = programmingLanguages.length > 0 
    ? programmingLanguages 
    : weightedLanguages;

  const primaryLanguage = candidateLanguages[0]?.language || 'Unknown';
  
  // 判断是否为多语言项目
  const totalBytes = weightedLanguages.reduce((sum, item) => sum + item.bytes, 0);
  const primaryBytes = candidateLanguages[0]?.bytes || 0;
  const primaryPercentage = (primaryBytes / totalBytes) * 100;
  
  // 如果主要语言占比小于70%，且有多个编程语言，则认为是多语言项目
  const isMultiLanguage = primaryPercentage < 70 && programmingLanguages.length > 1;
  
  // 获取次要语言（编程语言中的前3个，除了主要语言）
  const secondaryLanguages = candidateLanguages
    .slice(1, 4)
    .map(item => item.language);

  return {
    primary: primaryLanguage,
    secondary: secondaryLanguages,
    isMultiLanguage,
    distribution: candidateLanguages.map(item => ({
      language: item.language,
      percentage: Math.round((item.bytes / totalBytes) * 100),
      bytes: item.bytes
    }))
  };
}

export async function POST(request: NextRequest) {
  try {
    const { repoUrl } = await request.json();
    
    // 从 GitHub URL 中提取仓库信息
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return NextResponse.json({ error: '无效的 GitHub URL' }, { status: 400 });
    }
    
    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, '');
    
    // 准备 GitHub API 请求头
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'LearnGitHub'
    };
    
    // 如果有 GitHub token，则添加认证头
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    
    // 调用 GitHub API
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
      headers
    });
    
    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return NextResponse.json({ error: '仓库未找到，请检查 URL 是否正确或仓库是否为私有' }, { status: 404 });
      } else if (repoResponse.status === 403) {
        return NextResponse.json({ error: 'API 请求限制，请稍后重试' }, { status: 429 });
      } else {
        return NextResponse.json({ error: '无法访问 GitHub 仓库' }, { status: repoResponse.status });
      }
    }
    
    const repoData = await repoResponse.json();
    
    // 获取语言统计
    const languagesResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/languages`, {
      headers
    });
    
    const languages = languagesResponse.ok ? await languagesResponse.json() : {};
    
    // 使用优化的语言分析
    const languageAnalysis = analyzeLanguages(languages);
    
    // 获取 README 内容
    let readmeContent = '';
    try {
      const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/readme`, {
        headers
      });
      
      if (readmeResponse.ok) {
        const readme = await readmeResponse.json();
        readmeContent = Buffer.from(readme.content, 'base64').toString('utf-8');
      }
    } catch (error) {
      console.log('无法获取 README:', error);
    }
    
    // 获取贡献者信息
    let contributorsCount = 0;
    try {
      const contributorsResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/contributors?per_page=1`, {
        headers
      });
      
      if (contributorsResponse.ok) {
        const linkHeader = contributorsResponse.headers.get('link');
        if (linkHeader) {
          const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
          contributorsCount = lastPageMatch ? parseInt(lastPageMatch[1]) : 1;
        } else {
          const contributors = await contributorsResponse.json();
          contributorsCount = contributors.length;
        }
      }
    } catch (error) {
      console.log('无法获取贡献者信息:', error);
    }
    
    // 分析学习任务
    const learningTasks = generateLearningTasks(repoData, languages, readmeContent, contributorsCount, languageAnalysis);
    
    return NextResponse.json({
      repoInfo: {
        name: repoData.name,
        owner: repoData.owner.login,
        description: repoData.description || '这个项目还没有描述',
        language: languageAnalysis.primary,
        secondaryLanguages: languageAnalysis.secondary,
        isMultiLanguage: languageAnalysis.isMultiLanguage,
        languageDistribution: languageAnalysis.distribution,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        topics: repoData.topics || [],
        url: repoData.html_url,
        size: repoData.size,
        defaultBranch: repoData.default_branch,
        createdAt: repoData.created_at,
        updatedAt: repoData.updated_at,
        openIssues: repoData.open_issues_count,
        contributors: contributorsCount,
        hasWiki: repoData.has_wiki,
        hasPages: repoData.has_pages
      },
      learningTasks
    });
    
  } catch (error) {
    console.error('分析仓库时出错:', error);
    return NextResponse.json({ error: '分析失败，请重试' }, { status: 500 });
  }
}

function generateLearningTasks(repoData: any, languages: any, readmeContent: string, contributorsCount: number, languageAnalysis: any) {
  const tasks = [];
  const primaryLanguage = languageAnalysis.primary;
  const isMultiLanguage = languageAnalysis.isMultiLanguage;
  const secondaryLanguages = languageAnalysis.secondary || [];
  const repoSize = repoData.size;
  const complexity = repoSize > 10000 ? 'advanced' : repoSize > 1000 ? 'intermediate' : 'beginner';
  
  // 基础任务：了解项目
  tasks.push({
    id: 1,
    title: '项目概览与背景了解',
    description: `了解 ${repoData.name} 项目的基本信息、创建背景、目标和在开源社区中的地位`,
    difficulty: 'beginner',
    estimatedTime: '20分钟',
    type: 'reading',
    resources: ['README.md', '项目描述', 'GitHub 主页', '项目历史']
  });
  
  // 社区了解任务
  if (contributorsCount > 1) {
    tasks.push({
      id: 2,
      title: '开源社区了解',
      description: `了解项目的贡献者社区，包括主要维护者和贡献规则（${contributorsCount} 个贡献者）`,
      difficulty: 'beginner',
      estimatedTime: '15分钟',
      type: 'reading',
      resources: ['Contributors', 'CONTRIBUTING.md', 'Code of Conduct']
    });
  }
  
  // 环境配置任务
  if (readmeContent.toLowerCase().includes('install') || readmeContent.toLowerCase().includes('setup') || readmeContent.toLowerCase().includes('getting started')) {
    tasks.push({
      id: tasks.length + 1,
      title: '环境配置与运行',
      description: '根据项目文档配置开发环境、安装依赖并成功运行项目',
      difficulty: complexity === 'advanced' ? 'intermediate' : 'beginner',
      estimatedTime: complexity === 'advanced' ? '45分钟' : '30分钟',
      type: 'practice',
      resources: ['安装指南', 'package.json', 'requirements.txt', '配置文档']
    });
  }
  
  // 代码结构分析
  tasks.push({
    id: tasks.length + 1,
    title: '项目架构与代码结构分析',
    description: '深入了解项目的文件组织、模块划分和整体架构设计',
    difficulty: 'intermediate',
    estimatedTime: complexity === 'advanced' ? '90分钟' : '60分钟',
    type: 'reading',
    resources: ['源代码', '文件结构', '架构图', '设计文档']
  });
  
  // 主要技术栈学习
  if (primaryLanguage !== 'Unknown') {
    tasks.push({
      id: tasks.length + 1,
      title: `${primaryLanguage} 技术栈深度学习`,
      description: `深入学习项目中使用的 ${primaryLanguage} 技术栈、框架和最佳实践`,
      difficulty: complexity,
      estimatedTime: complexity === 'advanced' ? '3小时' : complexity === 'intermediate' ? '2小时' : '90分钟',
      type: 'reading',
      resources: [`${primaryLanguage} 文档`, '框架指南', '最佳实践', '性能优化']
    });
  }
  
  // 多语言项目的额外任务
  if (isMultiLanguage && secondaryLanguages.length > 0) {
    tasks.push({
      id: tasks.length + 1,
      title: '多语言技术栈学习',
      description: `学习项目中的其他编程语言和技术栈：${secondaryLanguages.join(', ')}`,
      difficulty: complexity === 'beginner' ? 'intermediate' : 'advanced',
      estimatedTime: '2-3小时',
      type: 'reading',
      resources: ['多语言模块', '跨语言集成', '构建系统', 'FFI/JNI 接口']
    });
  }
  
  // 核心功能理解
  tasks.push({
    id: tasks.length + 1,
    title: '核心功能与业务逻辑理解',
    description: '深入理解项目的核心功能、业务逻辑和解决的问题',
    difficulty: complexity,
    estimatedTime: complexity === 'advanced' ? '4小时' : complexity === 'intermediate' ? '2.5小时' : '1.5小时',
    type: 'reading',
    resources: ['核心模块', '业务逻辑', '功能文档', 'API 文档']
  });
  
  // 测试学习
  if (readmeContent.toLowerCase().includes('test') || languages.hasOwnProperty('JavaScript') || languages.hasOwnProperty('TypeScript') || 
      readmeContent.toLowerCase().includes('testing') || readmeContent.toLowerCase().includes('coverage')) {
    tasks.push({
      id: tasks.length + 1,
      title: '测试策略与质量保证',
      description: '学习项目的测试策略、测试用例编写和质量保证流程',
      difficulty: 'intermediate',
      estimatedTime: '90分钟',
      type: 'practice',
      resources: ['测试文件', '测试框架文档', 'CI/CD 配置', '代码覆盖率']
    });
  }
  
  // 实践任务
  if (repoData.open_issues_count > 0) {
    tasks.push({
      id: tasks.length + 1,
      title: '实践改进与贡献',
      description: '选择合适的 Issues 进行解决，或为项目添加新功能',
      difficulty: 'advanced',
      estimatedTime: '3-6小时',
      type: 'coding',
      resources: ['Open Issues', 'Good First Issues', 'Contributing 指南', '开发文档']
    });
  }
  
  // 部署与发布
  if (readmeContent.toLowerCase().includes('deploy') || readmeContent.toLowerCase().includes('build') || 
      repoData.has_pages || readmeContent.toLowerCase().includes('production')) {
    tasks.push({
      id: tasks.length + 1,
      title: '部署与发布流程',
      description: '学习项目的构建、部署和发布流程',
      difficulty: complexity === 'beginner' ? 'intermediate' : 'advanced',
      estimatedTime: '2小时',
      type: 'practice',
      resources: ['部署文档', 'CI/CD 配置', 'Docker 文件', '发布说明']
    });
  }
  
  // 高级主题
  if (complexity === 'advanced') {
    tasks.push({
      id: tasks.length + 1,
      title: '性能优化与扩展',
      description: '研究项目的性能瓶颈、优化策略和可扩展性设计',
      difficulty: 'advanced',
      estimatedTime: '4小时',
      type: 'reading',
      resources: ['性能分析', '优化文档', '扩展性设计', 'Benchmark']
    });
  }
  
  return tasks;
} 