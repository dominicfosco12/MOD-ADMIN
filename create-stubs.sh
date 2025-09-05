#!/bin/bash
set -e

# Base path
BASE="./src/app"

# Create MOD Organization pages
mkdir -p $BASE/org/teams $BASE/org/users $BASE/org/training-materials $BASE/org/reporting-tools

cat <<'EOF' > $BASE/org/teams/page.tsx
export default function Page() {
  return (
    <div className="px-2">
      <h1 className="text-2xl font-semibold">Teams</h1>
      <p className="mt-2 text-sm text-neutral-400">Build me next.</p>
    </div>
  );
}
EOF

cat <<'EOF' > $BASE/org/users/page.tsx
export default function Page() {
  return (
    <div className="px-2">
      <h1 className="text-2xl font-semibold">Users</h1>
      <p className="mt-2 text-sm text-neutral-400">Build me next.</p>
    </div>
  );
}
EOF

cat <<'EOF' > $BASE/org/training-materials/page.tsx
export default function Page() {
  return (
    <div className="px-2">
      <h1 className="text-2xl font-semibold">Training Materials</h1>
      <p className="mt-2 text-sm text-neutral-400">Build me next.</p>
    </div>
  );
}
EOF

cat <<'EOF' > $BASE/org/reporting-tools/page.tsx
export default function Page() {
  return (
    <div className="px-2">
      <h1 className="text-2xl font-semibold">Reporting Tools</h1>
      <p className="mt-2 text-sm text-neutral-400">Build me next.</p>
    </div>
  );
}
EOF

# Create MOD Clients pages
mkdir -p $BASE/clients/index $BASE/clients/users $BASE/clients/contacts

cat <<'EOF' > $BASE/clients/index/page.tsx
export default function Page() {
  return (
    <div className="px-2">
      <h1 className="text-2xl font-semibold">Clients</h1>
      <p className="mt-2 text-sm text-neutral-400">Build me next.</p>
    </div>
  );
}
EOF

cat <<'EOF' > $BASE/clients/users/page.tsx
export default function Page() {
  return (
    <div className="px-2">
      <h1 className="text-2xl font-semibold">Client Users</h1>
      <p className="mt-2 text-sm text-neutral-400">Build me next.</p>
    </div>
  );
}
EOF

cat <<'EOF' > $BASE/clients/contacts/page.tsx
export default function Page() {
  return (
    <div className="px-2">
      <h1 className="text-2xl font-semibold">Client Contacts</h1>
      <p className="mt-2 text-sm text-neutral-400">Build me next.</p>
    </div>
  );
}
EOF

# Create MOD Counterparties pages
mkdir -p $BASE/counterparties/prime-brokers \
         $BASE/counterparties/executing-brokers \
         $BASE/counterparties/custodians \
         $BASE/counterparties/fund-administrators \
         $BASE/counterparties/data-vendors

cat <<'EOF' > $BASE/counterparties/prime-brokers/page.tsx
export default function Page() {
  return (
    <div className="px-2">
      <h1 className="text-2xl font-semibold">Prime Brokers</h1>
      <p className="mt-2 text-sm text-neutral-400">Build me next.</p>
    </div>
  );
}
EOF

cat <<'EOF' > $BASE/counterparties/executing-brokers/page.tsx
export default function Page() {
  return (
    <div className="px-2">
      <h1 className="text-2xl font-semibold">Executing Brokers</h1>
      <p className="mt-2 text-sm text-neutral-400">Build me next.</p>
    </div>
  );
}
EOF

cat <<'EOF' > $BASE/counterparties/custodians/page.tsx
export default function Page() {
  return (
    <div className="px-2">
      <h1 className="text-2xl font-semibold">Custodians</h1>
      <p className="mt-2 text-sm text-neutral-400">Build me next.</p>
    </div>
  );
}
EOF

cat <<'EOF' > $BASE/counterparties/fund-administrators/page.tsx
export default function Page() {
  return (
    <div className="px-2">
      <h1 className="text-2xl font-semibold">Fund Administrators</h1>
      <p className="mt-2 text-sm text-neutral-400">Build me next.</p>
    </div>
  );
}
EOF

cat <<'EOF' > $BASE/counterparties/data-vendors/page.tsx
export default function Page() {
  return (
    <div className="px-2">
      <h1 className="text-2xl font-semibold">Data Vendors</h1>
      <p className="mt-2 text-sm text-neutral-400">Build me next.</p>
    </div>
  );
}
EOF

echo "✅ All stub pages created under src/app/"
