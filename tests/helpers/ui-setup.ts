import { configure } from "@testing-library/react";

// UI tests use the real scrypt verifier; allow for CPU contention on local/CI runs.
configure({ asyncUtilTimeout: 5000 });
