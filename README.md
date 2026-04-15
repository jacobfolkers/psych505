# Balloon Session

Balloon Session is a browser-based psychology experiment built with plain HTML, CSS, and JavaScript. It adapts the basic structure of the Balloon Analogue Risk Task (BART) into a cleaner, more polished balloon task that can run entirely in the browser and be hosted on GitHub Pages.

The study is designed to compare how a participant behaves when decisions only affect the self versus when decisions also affect a visible group outcome. Instead of syncing real participants in real time, the app simulates other participants locally during group rounds so the social environment feels active while the actual data collection stays simple and reliable.

## What the experiment does

The participant first enters a name or receives an auto-generated `Player ####` display name. They also complete a short baseline risk-appraisal questionnaire using a Likert scale. After that, the app guides them through:

1. A short practice block
2. Round 1: individual condition
3. Round 2: small-group condition
4. Round 3: large-group condition

In each trial, the participant can pump the balloon to increase possible points. Every additional pump also increases the chance that the balloon will pop. If the participant collects in time, they keep the points from that trial. If the balloon pops, those trial points are lost.

## Social manipulation

The app does not use live multiplayer. Group conditions are simulated in the browser.

This is intentional. The project focuses on the participant's experience of shared consequences and visible group accountability rather than true live interaction. In the group rounds, the interface makes that manipulation obvious through:

- a visible session display
- named participant cards using `Player ####` labels
- a large shared team score
- contribution updates tied to the team total
- a live activity feed
- round messaging such as "Your round status will appear on the session display."

These simulated participants are only used to create believable group context. They are not treated as real participant records.

## Data collection

The app stores the participant's trial data locally while they play and sends batch records to a Google Apps Script web app endpoint for logging into Google Sheets.

Only human participant data is logged:

- participant ID
- display name
- condition
- round
- trial number
- pumps
- whether the balloon popped
- points earned
- questionnaire score
- round summaries

Simulated player activity is kept separate from the real dataset and is only used for the on-screen social display and shared-score updates.

## Behavioral measures

The main behavioral measure is adjusted pumps:

- adjusted pumps = average number of pumps on trials that did not pop

The app also computes:

- pop rate by condition
- average cash-out points by condition
- total score by condition

These values are displayed on the results page along with the participant's baseline questionnaire scores and a histogram of trial behavior.

## Project structure

- `index.html`
  Entry page with participant naming and baseline risk questionnaire
- `start.html`
  Instructions, practice setup, and round transitions
- `bart.html`
  Main balloon task with timed trials, simulated social conditions, and shared team consequences in group rounds
- `results.html`
  End-of-study summary, condition comparisons, and histogram
- `apps-script.gs`
  Google Apps Script logger for sending participant data to Google Sheets

## Technical approach

- Frontend: plain HTML, CSS, and JavaScript
- Hosting: GitHub Pages compatible
- Logging: Google Apps Script + Google Sheets
- No Firebase
- No Node.js
- No backend server

## Current design summary

This version of the project measures whether risk-taking changes across:

- acting alone
- acting in a smaller group where outcomes affect a shared score
- acting in a larger group where outcomes affect a shared score

The current design keeps the participant's behavioral data separate while making the group rounds psychologically salient through a shared team score. In those rounds, successful cash-outs help the team total and pops can reduce it, which shifts the study question from passive social presence toward shared responsibility under risk.
