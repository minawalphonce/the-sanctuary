# The Sanctuary

*Empowering Youth, Strengthening Community.*

The Sanctuary is a mobile-first web app (installable PWA) that helps church youth
teams look after their members. Admins sign in with Google and use it to:

- keep a directory of members (contact details, group, photo, notes)
- take attendance for regular and special sessions
- log follow-ups (calls, messages, visits) and their outcomes
- assign each member to a responsible admin
- see on the dashboard who has been missing and needs a follow-up

There is no backend server. **A Google Sheet is the database**, Firebase Auth
handles sign-in, and Firebase Hosting serves the app. Everything runs on free
tiers, and if you ever stop using the app your data is still a normal spreadsheet.

Each organisation runs its **own instance** (its own Firebase project and its own
sheet). Nothing is shared between organisations.

## Contributing (fork workflow)

1. **Fork** this repository on GitHub and clone your fork.
2. Add the original repo as `upstream` so you can stay up to date:
   ```bash
   git remote add upstream https://github.com/minawalphonce/the-sanctuary.git
   ```
3. Create a branch for your change (don't work on `main`):
   ```bash
   git checkout -b feature/short-description
   ```
4. Run the app locally and make your change. This needs your own instance's Firebase
   values in `source/app/.env` (see the setup doc below):
   ```bash
   cd source/app
   npm ci
   npm run dev
   ```
5. Make sure it lints and builds cleanly:
   ```bash
   npm run lint
   npm run build
   ```
6. Commit, push the branch to your fork, and open a **pull request** against `main`
   of the original repo. Describe what changed and why, and include screenshots for
   UI changes.
7. To pick up new changes later: `git fetch upstream && git rebase upstream/main`.

UI conventions: use Tailwind classes and the shadcn components already in
`source/app/src/components/ui/`, and follow the design in `ux/`.

## Set up a new instance for your organisation

Follow the step-by-step guide: **[docs/setup/NEW_INSTANCE.md](docs/setup/NEW_INSTANCE.md)**

## Roadmap

Progress is tracked in [GitHub issues](https://github.com/minawalphonce/the-sanctuary/issues).
Finished epics are crossed out.

**Epics**

- ~~**Admin & Access** ([#4](https://github.com/minawalphonce/the-sanctuary/issues/4)): Google sign-in, access check against the sheet, token refresh, profile and sign out~~
- ~~**Attendance** ([#2](https://github.com/minawalphonce/the-sanctuary/issues/2)): sessions list, take attendance, edit past sessions, special sessions~~
- ~~**Follow-up Log** ([#3](https://github.com/minawalphonce/the-sanctuary/issues/3)): assignments, log a contact, contact history, my follow-ups~~
- **Members & Classes** ([#1](https://github.com/minawalphonce/the-sanctuary/issues/1)): members list, profile, add and edit are done
  - Yearly class rollover ([#26](https://github.com/minawalphonce/the-sanctuary/issues/26))
- **PWA Shell** ([#5](https://github.com/minawalphonce/the-sanctuary/issues/5)): project bootstrap, app shell and installability are done
  - Basic offline support ([#9](https://github.com/minawalphonce/the-sanctuary/issues/9))
  - Loading and error states ([#10](https://github.com/minawalphonce/the-sanctuary/issues/10))

**Future**

- Push notifications (FCM)
- ~~Translations: English, Swedish, Arabic, Italian and German~~
- Reporting
- AI chat

## License

See [LICENSE](LICENSE).
