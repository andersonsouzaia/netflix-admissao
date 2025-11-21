import { config } from 'dotenv'
import { resolve } from 'path'
import { getDatabase } from '../lib/db'

// Carregar variáveis de ambiente
config({ path: resolve(process.cwd(), '.env.local') })

async function forceSeed() {
  try {
    console.log('Forçando inserção de dados mockados...')
    const supabase = getDatabase()

    // Limpar dados existentes (em ordem reversa de dependências)
    console.log('Limpando dados existentes...')
    await supabase.from('step_evaluation_modules').delete().neq('id', 0)
    await supabase.from('step_evaluation_questions').delete().neq('id', 0)
    await supabase.from('step_evaluations').delete().neq('id', 0)
    await supabase.from('step_fields').delete().neq('id', 0)
    await supabase.from('step_documents').delete().neq('id', 0)
    await supabase.from('admission_steps').delete().neq('id', 0)
    await supabase.from('admission_processes').delete().neq('id', 0)
    await supabase.from('units').delete().neq('id', 0)
    await supabase.from('courses').delete().neq('id', 0)
    console.log('Dados limpos!')

    // Inserir cursos de exemplo
    console.log('Inserindo cursos...')
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

    const { data: insertedCourses, error: coursesError } = await supabase
      .from('courses')
      .insert(courses)
      .select()

    if (coursesError) {
      throw new Error(`Error inserting courses: ${coursesError.message}`)
    }

    console.log(`✓ ${insertedCourses?.length || 0} cursos inseridos`)

    const courseIds = insertedCourses?.map(c => c.id) || []

    // Inserir unidades
    console.log('Inserindo unidades...')
    const units = [
      { course_id: courseIds[0], name: 'Unidade Centro', description: 'Campus localizado no centro da cidade' },
      { course_id: courseIds[0], name: 'Unidade Norte', description: 'Campus localizado na zona norte' },
      { course_id: courseIds[1], name: 'Unidade Principal', description: 'Campus principal' },
      { course_id: courseIds[2], name: 'EAD Nacional', description: 'Modalidade EAD para todo o Brasil' },
      { course_id: courseIds[3], name: 'Online', description: 'Curso totalmente online' }
    ]

    const { data: insertedUnits, error: unitsError } = await supabase
      .from('units')
      .insert(units)
      .select()

    if (unitsError) {
      throw new Error(`Error inserting units: ${unitsError.message}`)
    }

    console.log(`✓ ${insertedUnits?.length || 0} unidades inseridas`)

    const unitIds = insertedUnits?.map(u => u.id) || []

    // Inserir processos seletivos
    console.log('Inserindo processos seletivos...')
    const processes = [
      { unit_id: unitIds[0], name: 'Vestibular 2025.1', description: 'Processo seletivo para o primeiro semestre de 2025', is_active: true },
      { unit_id: unitIds[0], name: 'ENEM', description: 'Ingresso via nota do ENEM', is_active: true },
      { unit_id: unitIds[1], name: 'Vestibular 2025.1', description: 'Processo seletivo para o primeiro semestre de 2025', is_active: true },
      { unit_id: unitIds[2], name: 'Processo Seletivo', description: 'Processo único de seleção', is_active: true },
      { unit_id: unitIds[3], name: 'Inscrição Online', description: 'Inscrição direta para curso EAD', is_active: true },
      { unit_id: unitIds[4], name: 'Inscrição Livre', description: 'Inscrição aberta para curso livre', is_active: true }
    ]

    const { data: insertedProcesses, error: processesError } = await supabase
      .from('admission_processes')
      .insert(processes)
      .select()

    if (processesError) {
      throw new Error(`Error inserting processes: ${processesError.message}`)
    }

    console.log(`✓ ${insertedProcesses?.length || 0} processos inseridos`)

    const processIds = insertedProcesses?.map(p => p.id) || []

    // Inserir passos do formulário para o primeiro processo
    console.log('Inserindo passos do formulário...')
    const steps = [
      { process_id: processIds[0], step_type: 'basic_data', name: 'Dados Básicos', order_index: 1, is_required: true },
      { process_id: processIds[0], step_type: 'complementary_data', name: 'Endereço', order_index: 2, is_required: true },
      { process_id: processIds[0], step_type: 'documents', name: 'Documentos', order_index: 3, is_required: true },
      { process_id: processIds[0], step_type: 'evaluation', name: 'Avaliação', order_index: 4, is_required: true },
      { process_id: processIds[0], step_type: 'payment', name: 'Pagamento', order_index: 5, is_required: true },
      { process_id: processIds[0], step_type: 'contract', name: 'Contrato', order_index: 6, is_required: true }
    ]

    const { data: insertedSteps, error: stepsError } = await supabase
      .from('admission_steps')
      .insert(steps)
      .select()

    if (stepsError) {
      throw new Error(`Error inserting steps: ${stepsError.message}`)
    }

    console.log(`✓ ${insertedSteps?.length || 0} passos inseridos`)

    const stepIds = insertedSteps?.map(s => s.id) || []

    // Inserir campos personalizados para o passo de dados complementares
    console.log('Inserindo campos personalizados...')
    const fields = [
      { step_id: stepIds[1], field_name: 'phone', field_label: 'Telefone', field_type: 'text', is_required: true, order_index: 1 },
      { step_id: stepIds[1], field_name: 'birth_date', field_label: 'Data de Nascimento', field_type: 'date', is_required: true, order_index: 2 },
      { step_id: stepIds[1], field_name: 'address', field_label: 'Endereço', field_type: 'textarea', is_required: true, order_index: 3 },
      { step_id: stepIds[1], field_name: 'city', field_label: 'Cidade', field_type: 'text', is_required: true, order_index: 4 },
      { 
        step_id: stepIds[1], 
        field_name: 'state', 
        field_label: 'Estado', 
        field_type: 'select', 
        is_required: true, 
        order_index: 5,
        options: JSON.stringify(['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'])
      }
    ]

    const { error: fieldsError } = await supabase
      .from('step_fields')
      .insert(fields)

    if (fieldsError) {
      throw new Error(`Error inserting fields: ${fieldsError.message}`)
    }

    console.log(`✓ ${fields.length} campos inseridos`)

    // Inserir documentos exigidos
    console.log('Inserindo documentos exigidos...')
    const documents = [
      { step_id: stepIds[2], name: 'RG', description: 'Cópia do RG ou CNH', is_required: true, accepted_formats: JSON.stringify(['pdf', 'jpg', 'png']), max_size_mb: 5, order_index: 1 },
      { step_id: stepIds[2], name: 'CPF', description: 'Cópia do CPF', is_required: true, accepted_formats: JSON.stringify(['pdf', 'jpg', 'png']), max_size_mb: 5, order_index: 2 },
      { step_id: stepIds[2], name: 'Comprovante de Residência', description: 'Comprovante de endereço recente', is_required: true, accepted_formats: JSON.stringify(['pdf']), max_size_mb: 10, order_index: 3 },
      { step_id: stepIds[2], name: 'Histórico Escolar', description: 'Histórico escolar do ensino médio', is_required: true, accepted_formats: JSON.stringify(['pdf']), max_size_mb: 10, order_index: 4 }
    ]

    const { error: documentsError } = await supabase
      .from('step_documents')
      .insert(documents)

    if (documentsError) {
      throw new Error(`Error inserting documents: ${documentsError.message}`)
    }

    console.log(`✓ ${documents.length} documentos inseridos`)

    // Inserir avaliação
    console.log('Inserindo avaliação...')
    const { data: insertedEvaluation, error: evaluationError } = await supabase
      .from('step_evaluations')
      .insert({
        step_id: stepIds[3],
        name: 'Prova de Conhecimentos Gerais',
        description: 'Avaliação online com questões de múltipla escolha',
        evaluation_type: 'online',
        instructions: 'A prova tem duração de 120 minutos. Leia atentamente cada questão antes de responder.',
        time_limit_minutes: 120
      })
      .select()
      .single()

    if (evaluationError) {
      throw new Error(`Error inserting evaluation: ${evaluationError.message}`)
    }

    console.log('✓ Avaliação inserida')

    const evaluationId = insertedEvaluation?.id

    if (!evaluationId) {
      throw new Error('Failed to get evaluation ID')
    }

    // Inserir módulos de conteúdo para a avaliação
    console.log('Inserindo módulos de conteúdo...')
    const modules = [
      {
        evaluation_id: evaluationId,
        name: 'Módulo 1: Língua Portuguesa',
        content: 'Conteúdo sobre gramática, interpretação de texto e redação.',
        order_index: 1
      },
      {
        evaluation_id: evaluationId,
        name: 'Módulo 2: Matemática',
        content: 'Conteúdo sobre álgebra, geometria e estatística.',
        order_index: 2
      },
      {
        evaluation_id: evaluationId,
        name: 'Módulo 3: Conhecimentos Gerais',
        content: 'Conteúdo sobre história, geografia e atualidades.',
        order_index: 3
      }
    ]

    const { error: modulesError } = await supabase
      .from('step_evaluation_modules')
      .insert(modules)

    if (modulesError) {
      throw new Error(`Error inserting modules: ${modulesError.message}`)
    }

    console.log(`✓ ${modules.length} módulos inseridos`)

    console.log('\n✅ Dados mockados criados com sucesso no Supabase!')
    console.log('\nResumo:')
    console.log(`  - ${courses.length} cursos`)
    console.log(`  - ${units.length} unidades`)
    console.log(`  - ${processes.length} processos seletivos`)
    console.log(`  - ${steps.length} passos do formulário`)
    console.log(`  - ${fields.length} campos personalizados`)
    console.log(`  - ${documents.length} documentos exigidos`)
    console.log(`  - 1 avaliação com ${modules.length} módulos`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao criar dados mockados:', error)
    process.exit(1)
  }
}

forceSeed()

