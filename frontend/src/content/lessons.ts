import { CompoundInterestCalculator } from '../components/Learning/Widgets/CompoundInterestCalculator';
import { RiskRewardSlider } from '../components/Learning/Widgets/RiskRewardSlider';
import { QuizWidget } from '../components/Learning/Widgets/QuizWidget';
import { GenericCalculator } from '../components/Learning/Widgets/GenericCalculator';
import { VisualEstimator } from '../components/Learning/Widgets/VisualEstimator';
import { CodePlayground } from '../components/Learning/Widgets/CodePlayground';

export interface Lesson {
    id: string;
    slug: string;
    title: string;
    category: string;
    difficulty: string;
    readTime: number; // minutes
    description: string;
    content: string[];
    formula?: {
        title: string;
        latex: string;
        description: string;
    };
    widget?: React.FC<any>;
    widgetProps?: any;
    quiz?: {
        question: string;
        options: string[];
        correctIndex: number;
        explanation: string;
    }[];
}

export const lessons_en: Lesson[] = [
    {
        id: '1',
        slug: 'time-value-of-money',
        title: 'The Time Value of Money',
        category: 'Finance',
        difficulty: 'Beginner',
        readTime: 10,
        description: 'Understand why a dollar today is worth more than a dollar tomorrow, and how compound interest works.',
        content: [
            "The Time Value of Money (TVM) is a core financial concept that states that a sum of money is worth more now than the same sum will be at a future date due to its earning potential in the interim.",
            "This core principle of finance holds that, provided money can earn interest, any amount of money is worth more the sooner it is received. TVM is also sometimes referred to as present discounted value.",
            "The formula for Future Value (FV) allows investors to predict how much an investment will be worth after a certain period at a given interest rate."
        ],
        formula: {
            title: 'Future Value Formula',
            latex: 'FV = PV \\times (1 + r)^n',
            description: 'Where PV is Present Value, r is the annual interest rate, and n is the number of years.'
        },
        widget: CompoundInterestCalculator,
        quiz: [
            {
                question: "If you invest $1,000 at 5% annual interest, roughly how much will you have in 10 years?",
                options: ["$1,500", "$1,628", "$2,000", "$1,050"],
                correctIndex: 1,
                explanation: "Using compound interest formula: 1000 * (1.05)^10 ≈ 1628.89."
            },
            {
                question: "Which factor does NOT affect the Future Value directly in the basic formula?",
                options: ["Inflation rate", "Time period", "Interest rate", "Principal amount"],
                correctIndex: 0,
                explanation: "The basic FV formula (assuming nominal return) uses Principal, Rate, and Time. Inflation affects 'Real' value but not the nominal calculation."
            }
        ]
    },
    {
        id: '2',
        slug: 'risk-reward-ratios',
        title: 'Mastering Risk/Reward Ratios',
        category: 'Trading',
        difficulty: 'Intermediate',
        readTime: 15,
        description: 'Learn how to calculate expected value and structure your trades for long-term profitability.',
        content: [
            "The risk/reward ratio marks the prospective reward an investor can earn for every dollar they risk on an investment. Many investors use this ratio to compare the expected returns of an investment with the amount of risk they must undertake to earn these returns.",
            "A ratio of 1:3 suggests that for every $1 you risk, you stand to make $3 in profit. Professional traders often look for ratios of 1:2 or better."
        ],
        formula: { title: 'Expected Value', latex: 'EV = (Win% * Reward) - (Loss% * Risk)', description: 'Positive EV is required for long term success.' },
        widget: RiskRewardSlider,
        quiz: [{ question: "Min win rate for 1:2 R/R?", options: ["20%", "33%", "50%"], correctIndex: 1, explanation: "33%" }]
    },
    {
        id: 'f1', slug: 'dcf-valuation', title: 'Valuation Basics (DCF)', category: 'Finance', difficulty: 'Advanced', readTime: 25,
        description: 'The intrinsic value of any asset is the present value of its future cash flows.',
        content: ["Discounted Cash Flow (DCF) analysis attempts to figure out the value of an investment today, based on projections of how much money it will generate in the future.", "If the DCF value is higher than the current cost of the investment, the opportunity may be a good one."],
        widget: GenericCalculator,
        widgetProps: {
            title: "Simplified DCF Valuator",
            inputs: [
                { name: "cf", label: "Example Cash Flow ($)", min: 100, max: 1000, step: 10, defaultValue: 100 },
                { name: "growth", label: "Growth Rate (%)", min: 0, max: 20, step: 1, defaultValue: 5 },
                { name: "discount", label: "Discount Rate (%)", min: 1, max: 20, step: 1, defaultValue: 10 }
            ],
            formula: (vals: any) => vals.cf * (1 + vals.growth / 100) / (vals.discount / 100 - vals.growth / 100), // Gordon Growth
            resultLabel: "Terminal Value (Approx)",
            resultPrefix: "$"
        },
        quiz: [{ question: "What does 'Discount Rate' typically represent?", options: ["The risk-free rate + risk premium", "The coupon rate", "The inflation rate"], correctIndex: 0, explanation: "It represents projected risk." }]
    },
    {
        id: 't2', slug: 'position-sizing', title: 'Position Sizing Mastery', category: 'Trading', difficulty: 'Intermediate', readTime: 20,
        description: 'The secret to surviving losing streaks.',
        content: ["Never risk more than 1-2% of your account on a single trade."],
        widget: GenericCalculator,
        widgetProps: {
            title: "Size Calculator",
            inputs: [{ name: "risk", label: "Risk %", min: 0.5, max: 5, step: 0.5, defaultValue: 1 }, { name: "sl", label: "Stop Loss Dist (%)", min: 1, max: 20, step: 0.5, defaultValue: 5 }],
            formula: (vals: any) => (100000 * (vals.risk / 100)) / (vals.sl / 100), // Assuming 100k account
            resultLabel: "Position Size ($)",
            resultPrefix: "$"
        },
        quiz: [{ question: "If SL distance increases, position size should...?", options: ["Decrease", "Increase", "Stay same"], correctIndex: 0, explanation: "To keep $ risk constant." }]
    },
    {
        id: 'm1', slug: 'expected-value', title: 'Expected Value (EV)', category: 'Math', difficulty: 'Beginner', readTime: 15,
        description: 'The single most important number in decision theory.',
        content: ["Every decision is a probability bet."],
        widget: GenericCalculator,
        widgetProps: {
            title: "EV Calculator",
            inputs: [{ name: "winProb", label: "Win Prob (%)", min: 10, max: 90, step: 5, defaultValue: 40 }, { name: "winAmt", label: "Win Amt ($)", min: 100, max: 1000, step: 50, defaultValue: 200 }, { name: "lossAmt", label: "Loss Amt ($)", min: 50, max: 500, step: 10, defaultValue: 100 }],
            formula: (vals: any) => (vals.winProb / 100 * vals.winAmt) - ((100 - vals.winProb) / 100 * vals.lossAmt),
            resultLabel: "Expected Value",
            resultPrefix: "$"
        },
        quiz: [{ question: "You should take trades with...", options: ["Positive EV", "Negative EV", "Neutral EV"], correctIndex: 0, explanation: "Positive expectancy." }]
    },
    {
        id: 'c4', slug: 'signal-rules', title: 'Defining Signal Rules', category: 'Coding', difficulty: 'Beginner', readTime: 12,
        description: 'Boolean logic for entries.',
        content: ["If SMA(50) > SMA(200) AND RSI < 30..."],
        widget: CodePlayground,
        widgetProps: { language: 'python', initialCode: "if fast_ma > slow_ma and rsi < 30:\n  buy()", outputDescription: "Signal Check", runAction: () => "Signal: BUY triggered" },
        quiz: [{ question: "Golden Cross is...", options: ["50MA crosses above 200MA", "200MA crosses above 50MA", "Price crosses MA"], correctIndex: 0, explanation: "Bullish signal." }]
    },
    // NEW LESSONS ADDED (Total ~8)
    {
        id: 'algo1', slug: 'algo-basics', title: 'Intro to Algorithmic Trading', category: 'Coding', difficulty: 'Beginner', readTime: 20,
        description: 'What is an algorithm and how does it trade?',
        content: ["Algorithmic trading follows a defined set of instructions to place a trade."],
        widget: CodePlayground,
        widgetProps: { language: 'python', initialCode: "print('Hello Algo World')", outputDescription: "Basic Print", runAction: () => "Hello Algo World" },
        quiz: [{ question: "Main benefit?", options: ["Speed", "Guarantee", "Cost"], correctIndex: 0, explanation: "Speed and emotionless execution." }]
    },
    {
        id: 'rm1', slug: 'sharpe-ratio', title: 'Understanding Sharpe Ratio', category: 'Finance', difficulty: 'Advanced', readTime: 15,
        description: 'Risk-adjusted return measurement.',
        content: ["The Sharpe ratio compares return to risk."],
        formula: { title: 'Sharpe Ratio', latex: 'S = (R_p - R_f) / \\sigma_p', description: 'Return - RiskFree / StdDev' },
        quiz: [{ question: "A higher Sharpe is...", options: ["Better", "Worse", "Same"], correctIndex: 0, explanation: "More return per unit of risk." }]
    },
    {
        id: 'psy1', slug: 'trading-psychology', title: 'Trading Psychology', category: 'Trading', difficulty: 'Beginner', readTime: 10,
        description: 'Mastering your emotions.',
        content: ["Fear and Greed drive markets."],
        quiz: [{ question: "FOMO is?", options: ["Fear Of Missing Out", "Fun", "Fast"], correctIndex: 0, explanation: "Emotional trigger." }]
    }
];

export const lessons_fr: Lesson[] = [
    {
        id: '1',
        slug: 'time-value-of-money',
        title: 'La Valeur Temporelle de L\'argent',
        category: 'Finance',
        difficulty: 'Débutant',
        readTime: 10,
        description: 'Comprenez pourquoi un dollar aujourd\'hui vaut plus qu\'un dollar demain, et comment fonctionnent les intérêts composés.',
        content: [
            "La valeur temporelle de l'argent (TVM) est un concept financier fondamental qui stipule qu'une somme d'argent vaut plus maintenant qu'elle ne le sera à une date ultérieure en raison de son potentiel de gain dans l'intervalle.",
            "Ce principe de base de la finance soutient que, pourvu que l'argent puisse rapporter des intérêts, toute somme d'argent vaut plus tôt elle est reçue. La TVM est aussi parfois appelée valeur actualisée.",
            "La formule de la valeur future (FV) permet aux investisseurs de prédire combien vaudra un investissement après une certaine période à un taux d'intérêt donné."
        ],
        formula: {
            title: 'Formule de la Valeur Future',
            latex: 'FV = PV \\times (1 + r)^n',
            description: 'Où PV est la valeur actuelle, r est le taux d\'intérêt annuel, et n est le nombre d\'années.'
        },
        widget: CompoundInterestCalculator,
        quiz: [
            {
                question: "Si vous investissez 1 000 $ à 5 % d'intérêt annuel, environ combien aurez-vous dans 10 ans ?",
                options: ["1 500 $", "1 628 $", "2 000 $", "1 050 $"],
                correctIndex: 1,
                explanation: "En utilisant la formule des intérêts composés : 1000 * (1.05)^10 ≈ 1628,89."
            },
            {
                question: "Quel facteur n'affecte PAS directement la valeur future dans la formule de base ?",
                options: ["Taux d'inflation", "Période", "Taux d'intérêt", "Capital initial"],
                correctIndex: 0,
                explanation: "La formule de base de la FV utilise le capital, le taux et le temps. L'inflation affecte la valeur 'réelle' mais pas le calcul nominal."
            }
        ]
    },
    {
        id: '2',
        slug: 'risk-reward-ratios',
        title: 'Maîtriser les Ratios Risque/Récompense',
        category: 'Trading',
        difficulty: 'Intermédiaire',
        readTime: 15,
        description: 'Apprenez à calculer l\'espérance mathématique et à structurer vos transactions pour une rentabilité à long terme.',
        content: [
            "Le ratio risque/récompense marque la récompense prospective qu'un investisseur peut gagner pour chaque dollar qu'il risque sur un investissement.",
            "Un ratio de 1:3 suggère que pour chaque dollar risqué, vous pouvez réaliser 3 $ de profit. Les traders professionnels recherchent souvent des ratios de 1:2 ou mieux."
        ],
        formula: { title: 'Valeur Attendue (EV)', latex: 'EV = (Gagnant% * Récompense) - (Perdant% * Risque)', description: 'Une EV positive est requise pour un succès à long terme.' },
        widget: RiskRewardSlider,
        quiz: [{ question: "Taux de réussite minimum pour un R/R de 1:2 ?", options: ["20%", "33%", "50%"], correctIndex: 1, explanation: "33%" }]
    },
    {
        id: 'f1', slug: 'dcf-valuation', title: 'Bases de l\'Évaluation (DCF)', category: 'Finance', difficulty: 'Avancé', readTime: 25,
        description: 'La valeur intrinsèque de tout actif est la valeur actuelle de ses flux de trésorerie futurs.',
        content: ["L'analyse des flux de trésorerie actualisés (DCF) tente de déterminer la valeur d'un investissement aujourd'hui, sur la base de projections de l'argent qu'il générera à l'avenir.", "Si la valeur DCF est supérieure au coût actuel de l'investissement, l'opportunité peut être bonne."],
        widget: GenericCalculator,
        widgetProps: {
            title: "Évaluateur DCF Simplifié",
            inputs: [
                { name: "cf", label: "Flux de Trésorerie ($)", min: 100, max: 1000, step: 10, defaultValue: 100 },
                { name: "growth", label: "Taux de Croissance (%)", min: 0, max: 20, step: 1, defaultValue: 5 },
                { name: "discount", label: "Taux d'Actualisation (%)", min: 1, max: 20, step: 1, defaultValue: 10 }
            ],
            formula: (vals: any) => vals.cf * (1 + vals.growth / 100) / (vals.discount / 100 - vals.growth / 100),
            resultLabel: "Valeur Terminale (Approx)",
            resultPrefix: "$"
        },
        quiz: [{ question: "Que représente généralement le 'Taux d'Actualisation' ?", options: ["Le taux sans risque + prime de risque", "Le taux du coupon", "Le taux d'inflation"], correctIndex: 0, explanation: "Il représente le risque projeté." }]
    },
    {
        id: 't2', slug: 'position-sizing', title: 'Maîtrise du Dimensionnement de Position', category: 'Trading', difficulty: 'Intermédiaire', readTime: 20,
        description: 'Le secret pour survivre aux séries de pertes.',
        content: ["Ne risquez jamais plus de 1 à 2 % de votre compte sur une seule transaction."],
        widget: GenericCalculator,
        widgetProps: {
            title: "Calculateur de Taille",
            inputs: [{ name: "risk", label: "Risque %", min: 0.5, max: 5, step: 0.5, defaultValue: 1 }, { name: "sl", label: "Dist. Stop Loss (%)", min: 1, max: 20, step: 0.5, defaultValue: 5 }],
            formula: (vals: any) => (100000 * (vals.risk / 100)) / (vals.sl / 100),
            resultLabel: "Taille de Position ($)",
            resultPrefix: "$"
        },
        quiz: [{ question: "Si la distance du SL augmente, la taille de position doit... ?", options: ["Diminuer", "Augmenter", "Rester la même"], correctIndex: 0, explanation: "Pour garder le risque en $ constant." }]
    },
    {
        id: 'm1', slug: 'expected-value', title: 'Valeur Attendue (EV)', category: 'Mathématiques', difficulty: 'Débutant', readTime: 15,
        description: 'Le chiffre le plus important de la théorie de la décision.',
        content: ["Chaque décision est un pari probabiliste."],
        widget: GenericCalculator,
        widgetProps: {
            title: "Calculateur d'EV",
            inputs: [{ name: "winProb", label: "Prob. Gain (%)", min: 10, max: 90, step: 5, defaultValue: 40 }, { name: "winAmt", label: "Montant Gain ($)", min: 100, max: 1000, step: 50, defaultValue: 200 }, { name: "lossAmt", label: "Montant Perte ($)", min: 50, max: 500, step: 10, defaultValue: 100 }],
            formula: (vals: any) => (vals.winProb / 100 * vals.winAmt) - ((100 - vals.winProb) / 100 * vals.lossAmt),
            resultLabel: "Valeur Attendue",
            resultPrefix: "$"
        },
        quiz: [{ question: "Vous devriez prendre des trades avec...", options: ["Une EV positive", "Une EV négative", "Une EV neutre"], correctIndex: 0, explanation: "Espérance positive." }]
    },
    {
        id: 'c4', slug: 'signal-rules', title: 'Définir des Règles de Signal', category: 'Codage', difficulty: 'Débutant', readTime: 12,
        description: 'Logique booléenne pour les entrées.',
        content: ["Si SMA(50) > SMA(200) ET RSI < 30..."],
        widget: CodePlayground,
        widgetProps: { language: 'python', initialCode: "if fast_ma > slow_ma and rsi < 30:\n  buy()", outputDescription: "Vérification du Signal", runAction: () => "Signal: ACHAT déclenché" },
        quiz: [{ question: "Le 'Golden Cross' est...", options: ["50MA croise au-dessus de 200MA", "200MA croise au-dessus de 50MA", "Le prix croise la MA"], correctIndex: 0, explanation: "Signal haussier." }]
    }
];

export const getLessonsByLocale = (locale: string) => {
    return locale === 'fr' ? lessons_fr : lessons_en;
};

export const getLessonBySlug = (slug: string, locale: string) => {
    const lessons = getLessonsByLocale(locale);
    return lessons.find(l => l.slug === slug);
};

export const getCategoriesByLocale = (locale: string) => {
    const lessons = getLessonsByLocale(locale);
    return Array.from(new Set(lessons.map(l => l.category)));
};
