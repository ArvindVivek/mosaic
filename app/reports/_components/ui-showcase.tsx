/**
 * UI Showcase - Gaming Aesthetic Components
 * Example usage of enhanced Valorant-themed UI components
 */

'use client';

import { AgentIcon, AgentGrid } from './agent-icon';
import { StatCard, DuelistStatCard, ControllerStatCard, InitiatorStatCard, SentinelStatCard } from './visualizations/stat-card';
import { RoleIcon } from '@/components/ui/role-icons';

export function UIShowcase() {
  return (
    <div className="space-y-8 p-6">
      {/* Agent Icons with Role Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gradient-valorant">Enhanced Agent Icons</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Standard Icons with Role Badges</h3>
            <div className="flex gap-4 flex-wrap">
              <AgentIcon agentName="Jett" size="md" showGlow />
              <AgentIcon agentName="Omen" size="md" showGlow />
              <AgentIcon agentName="Sova" size="md" showGlow />
              <AgentIcon agentName="Sage" size="md" showGlow />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Large Icons with Role Info</h3>
            <div className="flex gap-6 flex-wrap">
              <AgentIcon agentName="Reyna" size="xl" showRole showGlow />
              <AgentIcon agentName="Brimstone" size="xl" showRole showGlow />
              <AgentIcon agentName="Breach" size="xl" showRole showGlow />
              <AgentIcon agentName="Cypher" size="xl" showRole showGlow />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Agent Grid</h3>
            <AgentGrid
              agents={['Jett', 'Reyna', 'Raze', 'Phoenix', 'Yoru', 'Neon']}
              size="lg"
              showGlow
            />
          </div>
        </div>
      </section>

      {/* Role Icons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gradient-valorant">Role Icons</h2>

        <div className="flex gap-6 items-center">
          <div className="flex flex-col items-center gap-2">
            <RoleIcon role="Duelist" size={32} showGlow />
            <span className="text-xs text-role-duelist font-medium">Duelist</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <RoleIcon role="Controller" size={32} showGlow />
            <span className="text-xs text-role-controller font-medium">Controller</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <RoleIcon role="Initiator" size={32} showGlow />
            <span className="text-xs text-role-initiator font-medium">Initiator</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <RoleIcon role="Sentinel" size={32} showGlow />
            <span className="text-xs text-role-sentinel font-medium">Sentinel</span>
          </div>
        </div>
      </section>

      {/* Gaming-Style Stat Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gradient-valorant">Gaming Stat Cards</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DuelistStatCard
            title="Kill/Death Ratio"
            value="1.45"
            comparison={{ value: 12.5, label: 'vs team average' }}
            description="Outstanding fragging performance"
          />

          <ControllerStatCard
            title="Map Control"
            value="78%"
            comparison={{ value: 8.3, label: 'vs tournament avg' }}
            description="Excellent territory denial"
          />

          <InitiatorStatCard
            title="First Bloods"
            value="24"
            comparison={{ value: 15.2, label: 'vs role average' }}
            description="Leading the charge"
          />

          <SentinelStatCard
            title="Site Holds"
            value="89%"
            comparison={{ value: 6.7, label: 'vs meta' }}
            description="Defensive anchor"
            highlight
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Headshot %"
            value="32.4%"
            variant="duelist"
            comparison={{ value: 18.9, label: 'above average' }}
            description="Exceptional precision"
          />

          <StatCard
            title="Ability Usage"
            value="94%"
            variant="controller"
            comparison={{ value: 3.2, label: 'vs optimal' }}
            description="Efficient utility management"
          />

          <StatCard
            title="Assists"
            value="156"
            variant="initiator"
            comparison={{ value: 22.1, label: 'vs last tournament' }}
            description="Team enabler"
            highlight
          />
        </div>
      </section>

      {/* Animation Showcase */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gradient-valorant">Gaming Effects</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-lg border-2 border-role-duelist bg-card hover-glow-duelist transition-all duration-300 cursor-pointer">
            <h3 className="text-lg font-semibold mb-2 text-role-duelist">Duelist Glow</h3>
            <p className="text-sm text-muted-foreground">Hover to see aggressive red glow effect</p>
          </div>

          <div className="p-6 rounded-lg border-2 border-role-controller bg-card hover-glow-controller transition-all duration-300 cursor-pointer scanline">
            <h3 className="text-lg font-semibold mb-2 text-role-controller">Controller Scan</h3>
            <p className="text-sm text-muted-foreground">Blue glow with scanline animation</p>
          </div>

          <div className="p-6 rounded-lg border-2 border-role-initiator bg-card hover-glow-initiator transition-all duration-300 cursor-pointer corner-accents">
            <h3 className="text-lg font-semibold mb-2 text-role-initiator">Initiator Accents</h3>
            <p className="text-sm text-muted-foreground">Green glow with corner decorations</p>
          </div>

          <div className="p-6 rounded-lg border-2 border-role-sentinel bg-card hover-glow-sentinel transition-all duration-300 cursor-pointer spotlight">
            <h3 className="text-lg font-semibold mb-2 text-role-sentinel">Sentinel Spotlight</h3>
            <p className="text-sm text-muted-foreground">Gold glow with pulsing spotlight</p>
          </div>
        </div>
      </section>

      {/* Gaming Underline Text */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gradient-valorant">Text Effects</h2>

        <div className="flex gap-6 flex-wrap">
          <span className="gaming-underline text-lg font-medium text-role-duelist cursor-pointer">
            Hover for Underline
          </span>
          <span className="text-gradient-valorant text-xl font-bold">
            Gradient Text
          </span>
          <span className="text-lg font-medium text-role-controller">
            Role Colored
          </span>
        </div>
      </section>
    </div>
  );
}
