import { getDatabase } from '../db'

export function seedDatabase() {
  const db = getDatabase()

  // Verificar se já existe dados
  const existingCourses = db.prepare('SELECT COUNT(*) as count FROM courses').get() as { count: number }
  if (existingCourses.count > 0) {
    console.log('Database already seeded')
    return
  }

  // Inserir cursos de exemplo
  const insertCourse = db.prepare(`
    INSERT INTO courses (name, description, image_url, type, modality)
    VALUES (?, ?, ?, ?, ?)
  `)

  const courses = [
    {
      name: 'Administração',
      description: 'Curso de graduação em Administração com foco em gestão estratégica e liderança.',
      image_url: '/business-execution-discipline.jpg',
      type: 'graduacao',
      modality: 'presencial'
    },
    {
      name: 'Psicologia',
      description: 'Curso de graduação em Psicologia com ênfase em psicologia clínica e organizacional.',
      image_url: '/emotional-intelligence-brain.jpg',
      type: 'graduacao',
      modality: 'presencial'
    },
    {
      name: 'MBA em Gestão de Negócios',
      description: 'Pós-graduação em Gestão de Negócios com foco em estratégia e inovação.',
      image_url: '/competitive-strategy-business.jpg',
      type: 'pos_graduacao',
      modality: 'ead'
    },
    {
      name: 'Marketing Digital',
      description: 'Curso livre de Marketing Digital com técnicas avançadas de SEO e redes sociais.',
      image_url: '/digital-marketing-advanced.jpg',
      type: 'livre',
      modality: 'ead'
    }
  ]

  const courseIds: number[] = []
  for (const course of courses) {
    const result = insertCourse.run(
      course.name,
      course.description,
      course.image_url,
      course.type,
      course.modality
    )
    courseIds.push(Number(result.lastInsertRowid))
  }

  // Inserir unidades
  const insertUnit = db.prepare(`
    INSERT INTO units (course_id, name, description)
    VALUES (?, ?, ?)
  `)

  const units = [
    { courseId: courseIds[0], name: 'Unidade Centro', description: 'Campus localizado no centro da cidade' },
    { courseId: courseIds[0], name: 'Unidade Norte', description: 'Campus localizado na zona norte' },
    { courseId: courseIds[1], name: 'Unidade Principal', description: 'Campus principal' },
    { courseId: courseIds[2], name: 'EAD Nacional', description: 'Modalidade EAD para todo o Brasil' },
    { courseId: courseIds[3], name: 'Online', description: 'Curso totalmente online' }
  ]

  const unitIds: number[] = []
  for (const unit of units) {
    const result = insertUnit.run(unit.courseId, unit.name, unit.description)
    unitIds.push(Number(result.lastInsertRowid))
  }

  // Inserir processos seletivos
  const insertProcess = db.prepare(`
    INSERT INTO admission_processes (unit_id, name, description, is_active)
    VALUES (?, ?, ?, ?)
  `)

  const processes = [
    { unitId: unitIds[0], name: 'Vestibular 2025.1', description: 'Processo seletivo para o primeiro semestre de 2025', isActive: true },
    { unitId: unitIds[0], name: 'ENEM', description: 'Ingresso via nota do ENEM', isActive: true },
    { unitId: unitIds[1], name: 'Vestibular 2025.1', description: 'Processo seletivo para o primeiro semestre de 2025', isActive: true },
    { unitId: unitIds[2], name: 'Processo Seletivo', description: 'Processo único de seleção', isActive: true },
    { unitId: unitIds[3], name: 'Inscrição Online', description: 'Inscrição direta para curso EAD', isActive: true },
    { unitId: unitIds[4], name: 'Inscrição Livre', description: 'Inscrição aberta para curso livre', isActive: true }
  ]

  const processIds: number[] = []
  for (const process of processes) {
    const result = insertProcess.run(
      process.unitId,
      process.name,
      process.description,
      process.isActive ? 1 : 0
    )
    processIds.push(Number(result.lastInsertRowid))
  }

  // Inserir passos do formulário para o primeiro processo
  const insertStep = db.prepare(`
    INSERT INTO admission_steps (process_id, step_type, name, order_index, is_required)
    VALUES (?, ?, ?, ?, ?)
  `)

  const steps = [
    { processId: processIds[0], stepType: 'basic_data', name: 'Dados Básicos', orderIndex: 1, isRequired: true },
    { processId: processIds[0], stepType: 'complementary_data', name: 'Endereço', orderIndex: 2, isRequired: true },
    { processId: processIds[0], stepType: 'documents', name: 'Documentos', orderIndex: 3, isRequired: true },
    { processId: processIds[0], stepType: 'evaluation', name: 'Avaliação', orderIndex: 4, isRequired: true },
    { processId: processIds[0], stepType: 'payment', name: 'Pagamento', orderIndex: 5, isRequired: true },
    { processId: processIds[0], stepType: 'contract', name: 'Contrato', orderIndex: 6, isRequired: true }
  ]

  const stepIds: number[] = []
  for (const step of steps) {
    const result = insertStep.run(
      step.processId,
      step.stepType,
      step.name,
      step.orderIndex,
      step.isRequired ? 1 : 0
    )
    stepIds.push(Number(result.lastInsertRowid))
  }

  // Inserir campos personalizados para o passo de dados complementares
  const insertField = db.prepare(`
    INSERT INTO step_fields (step_id, field_name, field_label, field_type, is_required, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const fields = [
    { stepId: stepIds[1], fieldName: 'phone', fieldLabel: 'Telefone', fieldType: 'text', isRequired: true, orderIndex: 1 },
    { stepId: stepIds[1], fieldName: 'birth_date', fieldLabel: 'Data de Nascimento', fieldType: 'date', isRequired: true, orderIndex: 2 },
    { stepId: stepIds[1], fieldName: 'address', fieldLabel: 'Endereço', fieldType: 'textarea', isRequired: true, orderIndex: 3 },
    { stepId: stepIds[1], fieldName: 'city', fieldLabel: 'Cidade', fieldType: 'text', isRequired: true, orderIndex: 4 },
    { stepId: stepIds[1], fieldName: 'state', fieldLabel: 'Estado', fieldType: 'select', isRequired: true, orderIndex: 5 }
  ]

  for (const field of fields) {
    const options = field.fieldType === 'select' 
      ? JSON.stringify(['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'])
      : null
    insertField.run(
      field.stepId,
      field.fieldName,
      field.fieldLabel,
      field.fieldType,
      field.isRequired ? 1 : 0,
      field.orderIndex
    )
  }

  // Inserir documentos exigidos
  const insertDocument = db.prepare(`
    INSERT INTO step_documents (step_id, name, description, is_required, accepted_formats, max_size_mb, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  const documents = [
    { stepId: stepIds[2], name: 'RG', description: 'Cópia do RG ou CNH', isRequired: true, formats: JSON.stringify(['pdf', 'jpg', 'png']), maxSize: 5, orderIndex: 1 },
    { stepId: stepIds[2], name: 'CPF', description: 'Cópia do CPF', isRequired: true, formats: JSON.stringify(['pdf', 'jpg', 'png']), maxSize: 5, orderIndex: 2 },
    { stepId: stepIds[2], name: 'Comprovante de Residência', description: 'Comprovante de endereço recente', isRequired: true, formats: JSON.stringify(['pdf']), maxSize: 10, orderIndex: 3 },
    { stepId: stepIds[2], name: 'Histórico Escolar', description: 'Histórico escolar do ensino médio', isRequired: true, formats: JSON.stringify(['pdf']), maxSize: 10, orderIndex: 4 }
  ]

  for (const doc of documents) {
  insertDocument.run(
      doc.stepId,
      doc.name,
      doc.description,
      doc.isRequired ? 1 : 0,
      doc.formats,
      doc.maxSize,
      doc.orderIndex
    )
  }

  // Inserir avaliação
  const insertEvaluation = db.prepare(`
    INSERT INTO step_evaluations (step_id, name, description, evaluation_type, instructions, time_limit_minutes)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const evaluationResult = insertEvaluation.run(
    stepIds[3],
    'Prova de Conhecimentos Gerais',
    'Avaliação online com questões de múltipla escolha',
    'online',
    'A prova tem duração de 120 minutos. Leia atentamente cada questão antes de responder.',
    120
  )

  const evaluationId = Number(evaluationResult.lastInsertRowid)

  // Inserir módulos de conteúdo para a avaliação
  const insertModule = db.prepare(`
    INSERT INTO step_evaluation_modules (evaluation_id, name, content, order_index)
    VALUES (?, ?, ?, ?)
  `)

  const modules = [
    {
      evaluationId,
      name: 'Módulo 1: Língua Portuguesa',
      content: 'Conteúdo sobre gramática, interpretação de texto e redação.',
      orderIndex: 1
    },
    {
      evaluationId,
      name: 'Módulo 2: Matemática',
      content: 'Conteúdo sobre álgebra, geometria e estatística.',
      orderIndex: 2
    },
    {
      evaluationId,
      name: 'Módulo 3: Conhecimentos Gerais',
      content: 'Conteúdo sobre história, geografia e atualidades.',
      orderIndex: 3
    }
  ]

  for (const module of modules) {
    insertModule.run(module.evaluationId, module.name, module.content, module.orderIndex)
  }

  console.log('Database seeded successfully')
}
