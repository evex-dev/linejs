# LINEJS Types

This package holds the various values and types of LINE.

## Examples

```ts
import * as LINETypes from "@evex/linejs-types";

...
    message.react(LINETypes.PredefinedReactionType.LOVE);
...
```

```ts
import type * as LINETypes from "@evex/linejs-types";

type getContacts = () => Promise<LINETypes.Contact[]>;
```
