export interface ProjectChallenge {
    title: string;
    text: string;
}

export interface ProjectSolution {
    title: string;
    text: string;
}

export interface NextCase {
    title: string;
    slug: string;
}

export interface Project {
    slug: string;
    thumbW: number;
    thumbH: number;
    title: string;
    heroImage: string;
    heroVideo?: string;
    images: string[];
    imageCaptions?: string[];
    role: string;
    tools: string;
    concept: string;
    narrative: string;
    challenge?: ProjectChallenge;
    solution?: ProjectSolution;
    liveUrl?: string;
    disclaimer?: string;
    nextCase?: NextCase;
}

export const projectsData: Project[] = [
    {
        slug: 'face-recognition-attendance-system',
        thumbW: 1600,
        thumbH: 1200,
        title: 'Face-Recognition Attendance System',
        heroImage: '/images/projects/project-one/hero.svg',
        images: ['/images/projects/project-one/hero.svg'],
        role: 'Minor Project',
        tools: 'Face Recognition, Computer Vision',
        concept: 'A minor project focused on using face recognition for an attendance workflow.',
        narrative: 'This project explored a face-recognition-based approach to attendance tracking. The resume identifies it as a minor project; detailed implementation notes, performance measurements, and a public demo were not provided.',
        challenge: {
            title: 'Project Focus',
            text: 'Explore how face recognition can support an attendance workflow. The supplied resume does not specify dataset details, evaluation metrics, or deployment environment.'
        },
        solution: {
            title: 'Project Summary',
            text: 'A face-recognition attendance system completed as a minor project. Specific architecture, libraries, and measured outcomes are intentionally not claimed here.'
        },
        nextCase: {
            title: 'Safety Hazard Detection',
            slug: 'safety-hazard-detection'
        }
    },
    {
        slug: 'safety-hazard-detection',
        thumbW: 1600,
        thumbH: 1200,
        title: 'Safety Hazard Detection',
        heroImage: '/images/projects/project-two/hero.svg',
        images: ['/images/projects/project-two/hero.svg'],
        role: '4-Month Internship',
        tools: 'Computer Vision, Machine Learning',
        concept: 'A safety-hazard detection project undertaken during a four-month internship.',
        narrative: 'Safety Hazard Detection was part of a four-month internship, as listed on the resume. The resume does not provide model details, datasets, deployment information, or measured results, so this page keeps the description factual.',
        challenge: {
            title: 'Project Focus',
            text: 'Work on a project centered on safety-hazard detection during an internship. Specific hazard classes and technical constraints were not listed in the supplied resume.'
        },
        solution: {
            title: 'Project Summary',
            text: 'The project is presented as internship experience without adding unverified claims about the model, accuracy, production use, or business impact.'
        },
        nextCase: {
            title: 'Face-Recognition Attendance System',
            slug: 'face-recognition-attendance-system'
        }
    }
];

