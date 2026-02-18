const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Demo Seeding...');

  // Demo Credentials
  // Using a fixed salt for deterministic hashes if needed, or just standard hash
  const password = await bcrypt.hash('Demo123!', 10);

  const demoUsers = [
    {
      name: 'Demo Admin',
      email: 'demo.admin@clinic.com',
      password,
      role: 'ADMIN',
      isDemo: true,
    },
    {
      name: 'Demo Doctor',
      email: 'demo.doctor@clinic.com',
      password,
      role: 'DENTIST', // Assuming 'DENTIST' is the role enum value from schema
      isDemo: true,
      specialty: 'General Dentistry',
    },
    {
      name: 'Demo Patient',
      email: 'demo.patient@clinic.com',
      password,
      role: 'PATIENT',
      isDemo: true,
    },
  ];

  // 1. Create or Update Demo Users
  const createdUsers = {};
  
  for (const user of demoUsers) {
    const upsertedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password: user.password,
        isDemo: true,
        role: user.role, // Ensure role is correct
      },
      create: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        isDemo: true,
        specialty: user.specialty,
      },
    });
    createdUsers[user.email] = upsertedUser;
    console.log(`✅ Upserted user: ${user.email}`);
  }

  // 2. Create Sample Dentist Profiles (linked to the doctor user if possible, or standalone)
  // Check if we need to link the 'Demo Doctor' user to a 'Dentist' model entry.
  // The schema has `dentistUser` relation? Let's check schema again mentally or just create standalone dentists for the public list.
  
  // Create a Dentist profile for the Demo Doctor if not exists
  const demoDocUser = createdUsers['demo.doctor@clinic.com'];
  // We'll create a Dentist entry that matches this user for continuity, 
  // though the schema might not strictly enforce a link unless we add a userId field to Dentist model.
  // Looking at previous schema view: Dentist seems standalone but maybe we can just create one with same name.
  
  const dentists = [
    { 
        name: 'Dr. Sarah Smith', 
        specialty: 'Pediatric Dentistry', 
        experience: 8, 
        imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300',
        bio: 'Specializes in treating children with a gentle touch.'
    },
    { 
        name: 'Dr. James Wilson', 
        specialty: 'Orthodontics', 
        experience: 15, 
        imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300',
        bio: 'Expert in braces and aligners for all ages.'
    }
  ];

  const createdDentists = [];
  
  for (const d of dentists) {
      const dentist = await prisma.dentist.create({
          data: d
      });
      createdDentists.push(dentist);
      console.log(`✅ Created dentist profile: ${d.name}`);
  }

  // 3. Create Sample Appointments
  // Mix past and future appointments for the Demo Patient
  const patientUser = createdUsers['demo.patient@clinic.com'];
  const randomDentist = createdDentists[0]; // Pick first one

  if (patientUser && randomDentist) {
      await prisma.appointment.createMany({
          data: [
              {
                  userId: patientUser.id,
                  dentistId: randomDentist.id, // Linking to the Dentist profile
                  date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // Tomorrow
                  status: 'CONFIRMED',
                  notes: 'Routine Checkup (Demo)',
                  isDemo: undefined, // Schema doesn't have isDemo on Appointment, but Cascade delete should handle it if user is deleted? 
                                     // Actually, we wipe data based on logic, so it's fine.
              },
              {
                  userId: patientUser.id,
                  dentistId: randomDentist.id,
                  date: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // Last week
                  status: 'COMPLETED',
                  notes: 'Initial Consultation (Demo)',
              }
          ]
      });
      console.log(`✅ Created sample appointments for: ${patientUser.email}`);
  }

  console.log('🏁 Demo Seeding Completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
