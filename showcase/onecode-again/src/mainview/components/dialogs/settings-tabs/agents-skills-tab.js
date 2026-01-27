"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsSkillsTab = AgentsSkillsTab;
var solid_js_1 = require("solid-js");
var lucide_solid_1 = require("lucide-solid");
var react_1 = require("motion/react");
var trpc_1 = require("../../../lib/trpc");
var utils_1 = require("../../../lib/utils");
var icons_1 = require("../../ui/icons");
// Hook to detect narrow screen
function useIsNarrowScreen() {
    var _a = (0, solid_js_1.createSignal)(false), isNarrow = _a[0], setIsNarrow = _a[1];
    (0, solid_js_1.createEffect)(function () {
        var checkWidth = function () {
            setIsNarrow(window.innerWidth <= 768);
        };
        checkWidth();
        window.addEventListener("resize", checkWidth);
        return function () { return window.removeEventListener("resize", checkWidth); };
    });
    return isNarrow;
}
function AgentsSkillsTab() {
    var isNarrowScreen = useIsNarrowScreen();
    var _a = (0, solid_js_1.createSignal)(null), expandedSkillName = _a[0], setExpandedSkillName = _a[1];
    var _b = trpc_1.trpc.skills.list.useQuery(undefined), _c = _b.data, skills = _c === void 0 ? [] : _c, isLoading = _b.isLoading;
    var openInFinderMutation = trpc_1.trpc.external.openInFinder.useMutation();
    var userSkills = skills.filter(function (s) { return s.source === "user"; });
    var projectSkills = skills.filter(function (s) { return s.source === "project"; });
    var handleExpandSkill = function (skillName) {
        setExpandedSkillName(expandedSkillName === skillName ? null : skillName);
    };
    var handleOpenInFinder = function (path) {
        openInFinderMutation.mutate(path);
    };
    return <div class="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
      {/* Header - hidden on narrow screens */}
      {!isNarrowScreen && <div class="flex flex-col space-y-1.5 text-center sm:text-left">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-semibold text-foreground">Skills</h3>
            <span class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">
              Beta
            </span>
          </div>
          <a href="https://code.claude.com/docs/en/skills" target="_blank" rel="noopener noreferrer" class="text-xs text-muted-foreground hover:text-foreground underline transition-colors">
            Documentation
          </a>
        </div>}

      {/* Skills List */}
      <div class="space-y-4">
        {isLoading ? <div class="bg-background rounded-lg border border-border p-4 text-sm text-muted-foreground text-center">
            Loading skills...
          </div> : skills.length === 0 ? <div class="bg-background rounded-lg border border-border p-6 text-center">
            <icons_1.SkillIcon class="h-8 w-8 text-muted-foreground/50 mx-auto mb-3"/>
            <p class="text-sm text-muted-foreground mb-2">
              No skills found
            </p>
            <p class="text-xs text-muted-foreground">
              Add skills to <code class="px-1 py-0.5 bg-muted rounded">~/.claude/skills/</code> or <code class="px-1 py-0.5 bg-muted rounded">.claude/skills/</code>
            </p>
          </div> : <>
            {/* User Skills */}
            {userSkills.length > 0 && <div class="space-y-2">
                <div class="text-xs text-muted-foreground">
                  ~/.claude/skills/
                </div>
                <div class="bg-background rounded-lg border border-border overflow-hidden">
                  <div class="divide-y divide-border">
                    {userSkills.map(function (skill) { return <SkillRow key={skill.name} skill={skill} isExpanded={expandedSkillName === skill.name} onToggle={function () { return handleExpandSkill(skill.name); }} onOpenInFinder={function () { return handleOpenInFinder(skill.path); }}/>; })}
                  </div>
                </div>
              </div>}

            {/* Project Skills */}
            {projectSkills.length > 0 && <div class="space-y-2">
                <div class="text-xs text-muted-foreground">
                  .claude/skills/
                </div>
                <div class="bg-background rounded-lg border border-border overflow-hidden">
                  <div class="divide-y divide-border">
                    {projectSkills.map(function (skill) { return <SkillRow key={skill.name} skill={skill} isExpanded={expandedSkillName === skill.name} onToggle={function () { return handleExpandSkill(skill.name); }} onOpenInFinder={function () { return handleOpenInFinder(skill.path); }}/>; })}
                  </div>
                </div>
              </div>}
          </>}
      </div>

      {/* Info Section */}
      <div class="pt-4 border-t border-border space-y-3">
        <div>
          <h4 class="text-xs font-medium text-foreground mb-1.5">
            How to use Skills
          </h4>
          <p class="text-xs text-muted-foreground">
            Mention a skill in chat with <code class="px-1 py-0.5 bg-muted rounded">@skill-name</code> or ask Claude to use it directly.
          </p>
        </div>
        <div>
          <h4 class="text-xs font-medium text-foreground mb-1.5">
            Creating Skills
          </h4>
          <p class="text-xs text-muted-foreground">
            Create a folder with a <code class="px-1 py-0.5 bg-muted rounded">SKILL.md</code> file in <code class="px-1 py-0.5 bg-muted rounded">~/.claude/skills/your-skill/</code>
          </p>
        </div>
      </div>
    </div>;
}
function SkillRow(_a) {
    var skill = _a.skill, isExpanded = _a.isExpanded, onToggle = _a.onToggle, onOpenInFinder = _a.onOpenInFinder;
    return <div>
      <button onClick={onToggle} class="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors">
        <lucide_solid_1.ChevronRight class={(0, utils_1.cn)("h-4 w-4 text-muted-foreground transition-transform flex-shrink-0", isExpanded && "rotate-90")}/>
        <div class="flex flex-col space-y-0.5 min-w-0 flex-1">
          <span class="text-sm font-medium text-foreground truncate">
            {skill.name}
          </span>
          {skill.description && <span class="text-xs text-muted-foreground truncate">
              {skill.description}
            </span>}
        </div>
      </button>

      <react_1.AnimatePresence initial={false}>
        {isExpanded && <react_1.motion.div initial={{
                height: 0,
                opacity: 0
            }} animate={{
                height: "auto",
                opacity: 1
            }} exit={{
                height: 0,
                opacity: 0
            }} transition={{
                height: {
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                },
                opacity: { duration: .2 }
            }} class="overflow-hidden">
            <div class="px-4 pb-4 pt-0 border-t border-border bg-muted/20">
              <div class="pt-3 space-y-2">
                <div>
                  <span class="text-xs font-medium text-foreground">Path</span>
                  <button onClick={function (e) {
                e.stopPropagation();
                onOpenInFinder();
            }} class="block text-xs text-muted-foreground font-mono mt-0.5 break-all text-left hover:text-foreground hover:underline transition-colors cursor-pointer">
                    {skill.path}
                  </button>
                </div>
                <div>
                  <span class="text-xs font-medium text-foreground">Usage</span>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    Type <code class="px-1 py-0.5 bg-muted rounded">@{skill.name}</code> in chat or ask Claude to use the {skill.name} skill.
                  </p>
                </div>
              </div>
            </div>
          </react_1.motion.div>}
      </react_1.AnimatePresence>
    </div>;
}
