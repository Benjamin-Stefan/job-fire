module.exports = {
    branches: ["main"],
    repositoryUrl: "https://github.com/Benjamin-Stefan/job-fire",
    plugins: [
        [
            "@semantic-release/commit-analyzer",
            {
                preset: "conventionalcommits",
                releaseRules: [
                    { type: "feat", release: "minor" },
                    { type: "fix", release: "patch" },
                    { type: "perf", release: "patch" },
                    { type: "docs", scope: "README", release: "patch" },
                    { type: "refactor", release: "patch" },
                    { type: "chore", release: false },
                    { type: "style", release: false },
                    { type: "test", release: false },
                    { type: "build", release: "patch" },
                ],
            },
        ],
        [
            "@semantic-release/release-notes-generator",
            {
                preset: "conventionalcommits",
                presetConfig: {
                    types: [
                        { type: "feat", section: "🚀 Features" },
                        { type: "fix", section: "🐛 Bug Fixes" },
                        { type: "perf", section: "⚡ Performance Improvements" },
                        { type: "revert", section: "⏪ Reverts" },
                        { type: "docs", section: "📚 Documentation", hidden: false },
                        { type: "style", section: "🎨 Styles", hidden: true },
                        { type: "refactor", section: "♻️ Code Refactoring" },
                        { type: "test", section: "✅ Tests", hidden: true },
                        { type: "build", section: "📦 Build System" },
                        { type: "ci", section: "👷 Continuous Integration", hidden: true },
                    ],
                },
                writerOpts: {
                    mainTemplate: `
{{#if version}}
### Version: {{version}}  
Released on: {{date}}

{{/if}}

{{#each commitGroups}}
### {{title}}

{{#each commits}}
* {{this.subject}} ([{{this.hash}}]({{../context.repository}}/commit/{{this.hash}}))
{{/each}}

{{/each}}

{{#if footer}}
{{footer}}
{{/if}}

---

`,
                },
            },
        ],
        "@semantic-release/changelog",
        "@semantic-release/npm",
        [
            "@semantic-release/git",
            {
                assets: ["CHANGELOG.md", "packages/*/package.json"],
                message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
            },
        ],
    ],
};
