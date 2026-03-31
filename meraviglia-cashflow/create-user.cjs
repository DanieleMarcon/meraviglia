const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'develop@lavorosporco.it',
    password: 'Mera5412!',
    email_confirm: true,
    user_metadata: {
      organization_id: 'a991cb25-27ad-4f43-b7b0-152e30ccfc4d'
    }
  })

  if (error) {
    console.error('ERROR:', error)
    process.exit(1)
  }

  console.log('USER CREATED:')
  console.log({
    id: data.user?.id,
    email: data.user?.email,
    user_metadata: data.user?.user_metadata
  })
}

run()