
const fs = require('fs');
let code = fs.readFileSync('app/(app)/subscriptions.tsx', 'utf8');

let search = 'const currentPlanId = user?.subscription?.planId || user?.subscriptionId;';
let replace = search + '\n  const basicPlanId = plans.find(p => p.name.toLowerCase() === \'basic\' || p.price === 0)?.id;\n  const effectiveCurrentPlanId = currentPlanId || basicPlanId;';

code = code.replace(search, replace);
code = code.replace(
  'const currentPlan = plans.find(p => p.id === currentPlanId);',
  'const currentPlan = plans.find(p => p.id === effectiveCurrentPlanId);'
);
code = code.replace(
  'const isCurrent = currentPlanId === plan.id;',
  'const isCurrent = effectiveCurrentPlanId === plan.id;'
);

fs.writeFileSync('app/(app)/subscriptions.tsx', code);

