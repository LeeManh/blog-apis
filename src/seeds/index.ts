import seedRole from './role.seed';

async function main() {
  // Run seedRole function here
  await seedRole();
}

main()
  .then(() => {
    console.log('✅ Seeding completed');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });
