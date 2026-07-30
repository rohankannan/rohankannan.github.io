---
title: 'What a treasury desk taught me about data science'
description: 'Three lessons from a summer building data tools at Cisco that no course had taught me.'
pubDate: 2026-07-29
---

I spent this summer as a treasury intern at Cisco, building data tooling for the team that manages the company's cash, investments, and buybacks. 
I went in expecting to learn finance. 
I did, and a lot — but the more durable lessons were about data science, and none of them came from a course. 


## Explainability is a feature, not a compromise
I built a transaction classifier, kind of like what you'd see in a banking app, except instead of the categories being "Entertainment" or "Utilities," they were more like "OPEX" or "A/R."
The transaction classifier I built uses K-Means clustering wrapped in a decision-tree surrogate.
On paper that's a downgrade — you're approximating your own model. 
In practice it was the whole point: when a tool categorizes 100,000+ transactions, nobody acts on its output until they can see *why* a transaction landed where it did. 
The surrogate tree turned "the model said so" into an explanation a reviewer could check, and that's what made it trustworthy enough to surface a substantial volume of misclassifications, which our cash team then verified and resolved.

## Meet people inside their tools

The bank-revenue dashboard lives in Excel. Not because Excel is the best visualization layer ever
built, but because a treasury team lives in spreadsheets, and a dashboard nobody opens is worth
exactly nothing. Same reason the rest of the tooling shipped as a simple command-line tool rather
than some web app: the goal is answers in front of people, with as little ceremony as possible.

## Forecasts should look forward

The team's Value-at-Risk model forecast risk from historical volatility — how much things moved in the past. 
Rebuilding it around implied volatility means the model now asks the market what it expects instead of assuming yesterday repeats. 
That switch is one line in a formula and a complete change in worldview, and it generalizes: a lot of models quietly assume the future is a rerun.

---

The common thread: the hard part of data science on a real team isn't the math — it's building
things people actually trust and use. The math still matters, though, which is
[what this fall is for](/blog/goals-for-next-semester/).
