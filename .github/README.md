# 🚀 GitHub Actions Workflows

Цей репозиторій містить набір автоматизованих workflow'ів для CI/CD процесів.

## 📋 Список Workflows

### 1. 🚀 Deploy to GitHub Pages (`deploy.yml`)
**Призначення:** Основний workflow для автоматичного деплою на GitHub Pages

**Тригери:**
- Push у гілку `main`
- Pull Request до `main`
- Ручний запуск (`workflow_dispatch`)

**Джоби:**
- 🔨 **Build** - Збірка проекту з lint перевіркою
- 🚀 **Deploy** - Деплой на GitHub Pages
- 🗄️ **Migrate** - Виконання Supabase міграцій
- 📢 **Notify** - Сповіщення про результат деплою

### 2. 🔍 PR Check (`pr-check.yml`)
**Призначення:** Перевірка якості коду в Pull Request'ах

**Тригери:**
- Відкриття PR
- Оновлення PR
- Повторне відкриття PR

**Джоби:**
- 🧪 **Code Quality Check** - Lint та збірка
- 📝 **TypeScript Check** - Перевірка типів
- 🗄️ **Migration Validation** - Валідація SQL міграцій
- 📊 **Bundle Size Analysis** - Аналіз розміру збірки

### 3. 🧹 Cleanup (`cleanup.yml`)
**Призначення:** Автоматичне очищення старих артефактів

**Тригери:**
- Розклад: щодня о 2:00 UTC
- Ручний запуск

**Джоби:**
- 🗑️ **Cleanup Build Artifacts** - Видалення старих артефактів (>7 днів)
- 🧽 **Cleanup Caches** - Очищення старих кешів (>7 днів)
- 🔄 **Cleanup Old Workflow Runs** - Видалення старих прогонів (>30 днів)

### 4. 🚨 Hotfix Deploy (`hotfix-deploy.yml`)
**Призначення:** Екстрений деплой для критичних виправлень

**Тригери:**
- Тільки ручний запуск з параметрами

**Параметри:**
- `reason` - Причина екстреного деплою
- `skip_tests` - Пропустити тести (для критичних випадків)
- `environment` - Середовище (production/staging)

## 🔧 Налаштування

### 1. Налаштування GitHub Pages

1. Перейдіть у **Settings** → **Pages**
2. В **Source** виберіть **GitHub Actions**
3. Збережіть налаштування

### 2. Налаштування Secrets

У **Settings** → **Secrets and variables** → **Actions** додайте:

#### Обов'язкові secrets:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Опціональні secrets (для Supabase міграцій):
```
SUPABASE_ACCESS_TOKEN=your-access-token
SUPABASE_PROJECT_REF=your-project-ref
SUPABASE_DB_PASSWORD=your-db-password
```

### 3. Налаштування Environment

1. Перейдіть у **Settings** → **Environments**
2. Створіть environment **github-pages**
3. Додайте захист гілки для `main`

## 🎯 Як використовувати

### Звичайний деплой
1. Зробіть push у гілку `main`
2. Workflow автоматично запуститься
3. Сайт буде оновлено на GitHub Pages

### Pull Request
1. Створіть PR до `main`
2. Автоматично запуститься перевірка коду
3. Переглядайте результати в **Checks**

### Екстрений деплой
1. Перейдіть у **Actions** → **Hotfix Deploy**
2. Натисніть **Run workflow**
3. Заповніть причину та оберіть середовище
4. Запустіть workflow

### Ручне очищення
1. Перейдіть у **Actions** → **Cleanup**
2. Натисніть **Run workflow**
3. Подтвердіть виконання

## 📊 Моніторинг

### Статус деплою
- Зелена галочка ✅ - Успішний деплой
- Червоний хрестик ❌ - Помилка деплою
- Жовте коло 🟡 - Деплой в процесі

### Логи
1. Перейдіть у **Actions**
2. Виберіть потрібний workflow run
3. Натисніть на джоб для перегляду логів

### Сповіщення
- Успішний деплой: URL сайту в логах
- Помилка деплою: Деталі помилки в логах
- Критичні помилки: Автоматичне створення Issue

## 🛠️ Налагодження

### Часті проблеми

#### 1. Помилка збірки
```bash
# Локально перевірте:
npm ci
npm run lint
npm run build
```

#### 2. Помилка деплою
- Перевірте налаштування GitHub Pages
- Переконайтеся що секрети налаштовані
- Перевірте permissions для workflow

#### 3. Помилка Supabase
- Перевірте SUPABASE_* secrets
- Переконайтеся що CLI має доступ
- Перевірте синтаксис міграцій

### Корисні команди

```bash
# Локальна перевірка
npm run lint
npm run build
npm run preview

# Перевірка міграцій
supabase db diff
supabase db push --dry-run
```

## 🔒 Безпека

### Захист secrets
- Ніколи не логуйте secrets у workflow
- Використовуйте `${{ secrets.NAME }}`
- Обмежте доступ до environment

### Branch protection
Рекомендовані налаштування для `main`:
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require up-to-date branches
- ✅ Include administrators

## 📈 Оптимізація

### Прискорення збірки
- ✅ Кешування dependencies
- ✅ Паралельні джоби
- ✅ Умовні виконання

### Економія ресурсів
- ✅ Автоматичне очищення
- ✅ Обмеження concurrent runs
- ✅ Continue-on-error для несуттєвих помилок

## 📞 Підтримка

При виникненні проблем:
1. Перевірте логи workflow
2. Переглядайте Issues в репозиторії
3. Зверніться до команди розробки

---

**Створено за допомогою GitHub Actions** 🚀