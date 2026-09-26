import { useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";

type Category = "symptom" | "disease" | "anamnesis";

interface Article {
  id: string;
  title: string;
  category: Category;
  summary: string;
  detail: string;
  icon: string;
}

const CATEGORY_LABELS: Record<Category, string> = {
  symptom: "Симптомы",
  disease: "Заболевания",
  anamnesis: "Анамнез",
};

const ARTICLES: Article[] = [
  { id: "cough", category: "symptom", icon: "", title: "Кашель",
    summary: "Сухой и продуктивный кашель, ключевые уточняющие вопросы.",
    detail: "Уточните характер кашля (сухой/влажный), длительность, время суток, связь с положением тела, наличие мокроты и её цвет, сопутствующую температуру и одышку. Продуктивный кашель с гнойной мокротой характерен для бактериальной инфекции нижних дыхательных путей." },
  { id: "dyspnea", category: "symptom", icon: "", title: "Одышка",
    summary: "Оценка одышки в покое и при нагрузке.",
    detail: "Спросите, возникает ли одышка в покое или только при нагрузке, сколько метров или этажей пациент может пройти без остановки, есть ли ортопноэ и приступы удушья по ночам — это признаки сердечной недостаточности." },
  { id: "pain", category: "symptom", icon: "", title: "Боль",
    summary: "Характеристики боли по схеме OPQRST.",
    detail: "Уточните начало, провокацию и облегчение, характер, иррадиацию, тяжесть по шкале 0–10 и время или динамику. Это структурированный подход к любой болевой жалобе." },
  { id: "dizziness", category: "symptom", icon: "", title: "Головокружение",
    summary: "Системное и несистемное головокружение.",
    detail: "Важно различать истинное вестибулярное головокружение с ощущением вращения и предобморочное состояние. Спросите о связи с изменением положения тела, шумом в ушах, потерей слуха и приёмом антигипертензивных препаратов." },
  { id: "fever", category: "symptom", icon: "", title: "Повышенная температура",
    summary: "Паттерн лихорадки и симптомы интоксикации.",
    detail: "Уточните максимальные цифры температуры, длительность, характер, эффект от жаропонижающих, наличие озноба и потоотделения — это помогает заподозрить очаг инфекции." },

  { id: "pneumonia", category: "disease", icon: "", title: "Пневмония",
    summary: "Внебольничная пневмония: клиника и факторы риска.",
    detail: "Классическая триада — лихорадка, продуктивный кашель, плевральная боль. Факторы риска: курение, переохлаждение, контакт с больными ОРВИ, хронические заболевания лёгких." },
  { id: "acs", category: "disease", icon: "", title: "Инфаркт",
    summary: "Острый коронарный синдром: типичная и атипичная клиника.",
    detail: "Давящая загрудинная боль с иррадиацией в левую руку или челюсть, холодный пот, страх смерти. У пожилых и диабетиков возможна атипичная форма. Факторы риска: курение, гипертония, наследственность, дислипидемия." },
  { id: "gastritis", category: "disease", icon: "", title: "Гастрит",
    summary: "Связь боли с приёмом пищи, факторы риска.",
    detail: "Боль или дискомфорт в эпигастрии, часто связанные с приёмом пищи, изжога, тошнота. Факторы риска: НПВП, алкоголь, инфекция H. pylori, стресс." },
  { id: "migraine", category: "disease", icon: "", title: "Мигрень",
    summary: "Диагностические критерии, триггеры, аура.",
    detail: "Односторонняя пульсирующая головная боль, усиливающаяся при физической активности, тошнота, свето- и звукобоязнь. У части пациентов предшествует аура." },
  { id: "hypertension", category: "disease", icon: "", title: "Артериальная гипертензия",
    summary: "Часто бессимптомна, важен анамнез.",
    detail: "Часто протекает бессимптомно и выявляется случайно. Уточните давность, максимальные цифры давления, регулярность приёма препаратов, поражение органов-мишеней и семейный анамнез." },

  { id: "history-basics", category: "anamnesis", icon: "", title: "Основные вопросы",
    summary: "С чего начинать сбор анамнеза.",
    detail: "Начните с открытого вопроса о жалобах, затем уточните историю текущего заболевания, анамнез жизни, факторы риска и семейный анамнез." },
  { id: "history-structure", category: "anamnesis", icon: "", title: "Структура сбора анамнеза",
    summary: "Жалобы → анамнез болезни → анамнез жизни → факторы риска.",
    detail: "Классическая структура: жалобы → история настоящего заболевания → анамнез жизни → факторы риска и образ жизни → семейный анамнез." },
  { id: "risk-factors", category: "anamnesis", icon: "", title: "Факторы риска",
    summary: "Курение, алкоголь, питание, активность, стресс.",
    detail: "Уточняйте курение, алкоголь, питание, физическую активность, профессиональные вредности и уровень стресса — эти данные важны почти для любого диагноза." },
  { id: "family-history", category: "anamnesis", icon: "", title: "Семейный анамнез",
    summary: "Наследственные заболевания у родственников.",
    detail: "Спросите о заболеваниях сердечно-сосудистой системы, диабете, онкологии и других значимых состояниях у родителей, братьев и сестёр." },
  { id: "allergy-history", category: "anamnesis", icon: "", title: "Аллергологический анамнез",
    summary: "Лекарственная и другая аллергия.",
    detail: "Уточните, была ли аллергия на лекарства, пищевые продукты или другие вещества, и как именно она проявлялась — это критично перед назначением терапии." },
];

export default function KnowledgeBasePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [selected, setSelected] = useState<Article | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARTICLES.filter(
      (a) =>
        (category === "all" || a.category === category) &&
        (q === "" || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)),
    );
  }, [query, category]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <header>
        <h1 className="font-serif text-3xl font-medium text-ink">Медицинская база знаний</h1>
        <p className="mt-1 text-muted">Справочные материалы по симптомам, заболеваниям и сбору анамнеза</p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию…"
            className="w-full rounded-lg border border-line bg-card py-2 pl-9 pr-3 text-sm focus:border-teal focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "symptom", "disease", "anamnesis"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                category === c
                  ? "border-teal bg-teal-light text-teal-dark"
                  : "border-line text-muted hover:border-teal/50"
              }`}
            >
              {c === "all" ? "Все" : CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((a) => (
          <div key={a.id} className="card-texture flex flex-col rounded-xl border border-line bg-card p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xl">{a.icon}</span>
              <span className="font-mono text-xs text-muted">{CATEGORY_LABELS[a.category]}</span>
            </div>
            <h2 className="font-serif text-base font-medium text-ink">{a.title}</h2>
            <p className="mt-1 flex-1 text-sm text-muted">{a.summary}</p>
            <button onClick={() => setSelected(a)} className="mt-3 self-start text-sm text-teal hover:text-teal-dark">
              Подробнее
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full">
            <EmptyState icon="🔍" title="Ничего не найдено" description="Попробуйте изменить запрос или выбрать другую категорию." />
          </div>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">{selected.icon}</span>
              <span className="font-mono text-xs text-muted">{CATEGORY_LABELS[selected.category]}</span>
            </div>
            <h2 className="font-serif text-xl font-medium text-ink">{selected.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink">{selected.detail}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}