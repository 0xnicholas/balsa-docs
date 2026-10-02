---
generated: true
editUrl: false
next: false
prev: false
title: "StepStatus"
---

> **StepStatus** = `"success"` \| `"failed"` \| `"suspended"`

Defined in: .framework/balsats-framework/packages/core/dist/workflows/snapshot.d.ts:16

A step result's status in a snapshot: it completed, it failed, or it suspended the run. The same
three readings the boundary events report, so the record and the stream never disagree.
