# Business Requirements Document
## VALORANT Automated Scouting Report Generator

**Cloud9 x JetBrains Hackathon | Category 2**

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Date | January 2026 |
| Author | Arvind \| ValVision.AI |
| Status | Draft for Development |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Business Objectives](#3-business-objectives)
4. [Scope Definition](#4-scope-definition)
5. [Functional Requirements](#5-functional-requirements)
6. [Data Requirements](#6-data-requirements)
7. [Technical Architecture](#7-technical-architecture)
8. [User Interface Requirements](#8-user-interface-requirements)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Acceptance Criteria](#10-acceptance-criteria)
11. [Appendices](#11-appendices)

---

## 1. Executive Summary

### 1.1 Purpose

This Business Requirements Document defines the specifications for an Automated Scouting Report Generator focused on professional VALORANT esports. The application will analyze historical match data from the GRID API to produce actionable intelligence reports for coaching staff, analysts, and players preparing for competitive matches.

### 1.2 Problem Statement

Professional esports coaching staffs currently face significant challenges in pre-match preparation:

- Manual VOD review consumes 8-12 hours per opponent
- Statistical analysis requires specialized data engineering skills
- Insights are often qualitative rather than data-driven
- Pattern recognition across multiple matches is time-prohibitive
- Counter-strategy development relies heavily on institutional knowledge

### 1.3 Proposed Solution

An automated scouting platform that ingests GRID API data, processes match histories through analytical pipelines, and generates structured reports containing team strategies, player tendencies, composition patterns, and actionable counter-strategies. The system will reduce preparation time from hours to minutes while increasing analytical depth and consistency.

### 1.4 Target Users

- **Head Coaches**: Strategic planning and team preparation
- **Analysts**: Deep-dive statistical research and pattern identification
- **Players**: Individual matchup preparation and tendency awareness
- **Team Managers**: High-level competitive intelligence

---

## 2. Project Overview

### 2.1 Project Context

This project is developed as part of the Cloud9 x JetBrains "Sky's The Limit" Hackathon, specifically addressing Category 2: Automated Scouting Report Generator. The application leverages official GRID esports data to provide professional-grade competitive intelligence.

### 2.2 Data Source

The application exclusively uses the GRID API ecosystem for data acquisition:

| API | Type | Purpose |
|-----|------|---------|
| Central Data API | GraphQL | Historical match data, team rosters, tournament info |
| Series State API | GraphQL | Detailed match state, round-by-round events |
| File Download API | REST | Bulk data exports, game logs |

### 2.3 Tournament Scope

For the hackathon demonstration, the application will focus on VCT Americas data from the past two years, including:

- VCT Americas League matches (regular season)
- VCT Americas Kickoff tournaments
- VCT Masters events featuring Americas teams
- VCT Champions featuring Americas teams

---

## 3. Business Objectives

### 3.1 Primary Objectives

1. Reduce scouting preparation time by 80% (from 8+ hours to under 90 minutes)
2. Provide quantitative backing for strategic decisions
3. Identify patterns invisible to manual analysis
4. Generate actionable counter-strategies with data-backed confidence levels

### 3.2 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Report Generation Time | < 60 seconds | End-to-end processing |
| Data Accuracy | 100% | Verified against source |
| Pattern Detection Rate | > 90% | Patterns with > 60% occurrence |
| Insight Actionability | > 85% | User feedback scoring |

### 3.3 Value Proposition

The scouting report generator delivers competitive advantage through three key differentiators:

1. **Speed**: Instant access to opponent intelligence vs. days of manual preparation
2. **Depth**: Statistical rigor across all available matches, not selective sampling
3. **Consistency**: Standardized analysis methodology eliminates human bias

---

## 4. Scope Definition

### 4.1 In Scope

**Core Report Generation:**
- Team-wide strategic pattern analysis
- Individual player tendency profiling
- Agent composition and meta analysis
- Map-specific strategy breakdowns
- Counter-strategy recommendations

**Analysis Categories:**
- Pistol round tendencies (Attack and Defense)
- Default site setups and rotations
- Economy management patterns
- First blood statistics and dueling patterns
- Clutch performance metrics
- Utility usage patterns

### 4.2 Out of Scope

- Real-time live match analysis
- Video/VOD processing and analysis
- Player positioning heatmaps (requires visual data)
- Ranked/competitive ladder data (non-professional)
- Social media sentiment analysis
- Integration with third-party coaching platforms

### 4.3 Assumptions

1. GRID API access remains available throughout development and demonstration
2. VCT Americas match data is complete and accurate in GRID systems
3. Team rosters in historical data reflect actual match participants
4. Round-by-round event data provides sufficient granularity for pattern detection

### 4.4 Constraints

- Analysis limited to data available through GRID APIs
- Pattern detection requires minimum 5 matches for statistical significance
- Hackathon timeline constrains feature depth

---

## 5. Functional Requirements

### 5.1 Report Generation (FR-100)

**FR-101: Team Selection Interface**

The system shall provide a searchable interface for selecting opponent teams from the VCT Americas ecosystem. Users can search by team name, abbreviation, or player name. The interface shall display team logo, current roster, and recent match count.

**FR-102: Match Range Configuration**

Users shall be able to specify the analysis scope by:
- Number of recent matches (5, 10, 15, 20, or all available)
- Date range (custom start and end dates)
- Tournament filter (specific events or all VCT Americas)
- Map filter (specific maps or all maps)

**FR-103: Report Generation Trigger**

Upon configuration, the system shall generate a complete scouting report within 60 seconds. Progress indication shall be displayed during generation. The system shall handle API rate limits gracefully with automatic retry logic.

### 5.2 Team Strategy Analysis (FR-200)

**FR-201: Attack Side Pistol Analysis**

The report shall identify and quantify attack-side pistol round strategies including:
- Fast execute frequency by site (percentage and count)
- Default/slow play frequency
- Most common agent leading the execute
- Utility usage patterns in pistol (flash, smoke, molly priorities)
- Success rate by strategy type

**FR-202: Defense Side Setup Analysis**

The report shall document defensive configurations including:
- Default player positioning (1-3-1, 2-2-1, etc.)
- Sentinel placement patterns by site
- Rotation trigger points and timing
- Retake vs. anchor tendencies
- Economy-based setup variations

**FR-203: Mid-Round Adaptation Patterns**

The system shall identify mid-round strategic adjustments including:
- Rotation speed by map region
- Information gathering utility usage
- Aggression triggers (when do they push?)
- Timeout impact on subsequent rounds

### 5.3 Player Tendency Analysis (FR-300)

**FR-301: Individual Performance Profiles**

For each player, the report shall include:
- Agent pool with pick rates and win rates
- Role consistency (duelist, controller, etc.)
- ACS (Average Combat Score) by agent and map
- First blood rate (attempts and success)
- Clutch statistics (1vX situations)
- KAST percentage trends

**FR-302: Dueling Analysis**

The system shall track head-to-head performance including:
- First duel win rate by map position
- Preferred peek positions
- Operator usage and effectiveness
- Weapon preferences by economy state
- Trade success rate

**FR-303: Utility Efficiency**

For utility-focused agents, track:
- Flash assist rate
- Smoke timing consistency
- Information utility value
- Ultimate economy patterns
- Ability damage per round

### 5.4 Composition Analysis (FR-400)

**FR-401: Team Composition Tracking**

The report shall catalog:
- Most played compositions with frequency
- Composition win rates by map
- Meta adaptation timeline
- Role flexibility indicators
- Comfort picks vs. meta picks

**FR-402: Map-Specific Compositions**

For each map in the pool, document:
- Preferred composition(s)
- Agent substitution patterns
- Map ban tendencies
- Pick/ban phase predictions

### 5.5 Counter-Strategy Generation (FR-500)

**FR-501: Weakness Identification**

The system shall automatically identify exploitable patterns including:
- Low win-rate scenarios with statistical significance
- Predictable timing windows
- Composition vulnerabilities
- Individual player weaknesses in specific situations

**FR-502: Actionable Recommendations**

Based on identified weaknesses, generate specific counter-strategies with:
- Recommended agent compositions to exploit weaknesses
- Timing-based strategies (e.g., "Push B at 1:15 when their Sentinel rotates")
- Economy exploitation opportunities
- Individual matchup recommendations

**FR-503: Confidence Scoring**

Each recommendation shall include:
- Sample size (number of data points)
- Confidence level (percentage based on statistical significance)
- Recency weighting (more recent matches weighted higher)
- Contextual caveats

---

## 6. Data Requirements

### 6.1 Data Sources

**GRID Central Data API (GraphQL):**
- Tournament and series metadata
- Team rosters and player information
- Match schedules and results
- Historical performance aggregates

**GRID Series State API (GraphQL):**
- Round-by-round game state
- Kill events with timestamps and positions
- Economy snapshots per round
- Agent selections and ability usage
- Spike plant/defuse events

### 6.2 Data Model

The following entities form the core data model:

| Entity | Key Attributes |
|--------|---------------|
| Team | team_id, name, abbreviation, region, logo_url, active_roster |
| Player | player_id, ign, real_name, team_id, role, country |
| Match | match_id, series_id, tournament_id, date, team1_id, team2_id, winner_id, map |
| Round | round_id, match_id, round_number, winner_side, win_condition, economy_state |
| PlayerRound | player_id, round_id, agent, kills, deaths, assists, damage, loadout_value |
| KillEvent | event_id, round_id, killer_id, victim_id, weapon, timestamp, is_first_blood |

### 6.3 Data Processing Pipeline

1. **Ingestion**: Fetch raw data from GRID APIs based on query parameters
2. **Normalization**: Transform API responses into standardized internal schema
3. **Aggregation**: Compute statistical summaries across match sets
4. **Pattern Detection**: Apply algorithmic analysis to identify recurring behaviors
5. **Insight Generation**: Synthesize patterns into actionable intelligence
6. **Report Rendering**: Format insights into structured report output

---

## 7. Technical Architecture

### 7.1 System Architecture

The application follows a three-tier architecture:

**Presentation Layer:**
- Next.js 14+ with App Router
- TailwindCSS for styling
- React components for interactive report views

**Application Layer:**
- Python FastAPI backend
- GraphQL client for GRID API integration
- Analytics engine for pattern detection
- Report generation service

**Data Layer:**
- PostgreSQL for processed match data
- Redis for caching frequent queries
- GRID API as authoritative data source

### 7.2 API Integration

**GRID API Authentication:**
- API key-based authentication
- Rate limit handling with exponential backoff
- Request batching for efficiency

**Key GraphQL Queries:**
- `teams`: Fetch team metadata and rosters
- `series`: Retrieve match series with filters
- `seriesState`: Get detailed round-by-round data
- `tournaments`: Access tournament structures

### 7.3 Analytics Engine

The pattern detection system employs:
- Statistical aggregation (means, medians, percentiles)
- Frequency analysis for strategy identification
- Trend detection across time periods
- Correlation analysis between variables
- Confidence interval calculation for recommendations

---

## 8. User Interface Requirements

### 8.1 Report Input Interface

**Team Selection:**
- Searchable dropdown with team logos
- Recent teams quick-select
- Team preview card showing roster and recent form

**Configuration Options:**
- Match count slider (5-20+ matches)
- Date range picker
- Tournament filter checkboxes
- Map selection (multi-select or all)

### 8.2 Report Output Interface

**Executive Summary Section:**
- Team overview card with logo, record, and key stats
- Top 3 actionable insights highlighted
- Quick-glance strength/weakness indicators

**Detailed Analysis Tabs:**
- **Team Strategies**: Attack/Defense breakdowns with visualizations
- **Player Profiles**: Individual stat cards with tendency highlights
- **Compositions**: Most-played comps with win rates
- **Map Analysis**: Per-map strategic breakdown
- **Counter-Strategies**: Prioritized recommendations with confidence scores

### 8.3 Export Options

- PDF export for offline review and printing
- Shareable link for team distribution
- Presentation mode for team meetings

---

## 9. Non-Functional Requirements

### 9.1 Performance

| Requirement | Target | Priority |
|-------------|--------|----------|
| Report generation time | < 60 seconds | High |
| Page load time | < 2 seconds | High |
| Concurrent users supported | 10+ | Medium |
| API response caching | 24 hours | Medium |

### 9.2 Reliability

- Graceful degradation when GRID API is unavailable
- Automatic retry logic for failed API requests
- Data validation to prevent report generation with incomplete data
- Error logging and monitoring

### 9.3 Usability

- Intuitive interface requiring no training
- Mobile-responsive design for on-the-go access
- Clear progress indicators during report generation
- Accessible color schemes and contrast ratios

### 9.4 Security

- GRID API credentials stored securely (environment variables)
- HTTPS encryption for all data transmission
- No storage of sensitive competitive intelligence beyond session
- Input sanitization to prevent injection attacks

---

## 10. Acceptance Criteria

### 10.1 Minimum Viable Product (MVP)

The following criteria must be met for hackathon submission:

1. User can select any VCT Americas team from a searchable list
2. System generates a complete report within 90 seconds
3. Report includes team strategy analysis (attack and defense patterns)
4. Report includes individual player tendency profiles
5. Report includes composition analysis with win rates
6. All statistics include sample sizes and date ranges
7. Report is visually formatted and readable

### 10.2 Enhanced Features (Stretch Goals)

1. Counter-strategy recommendations with confidence scores
2. Map-specific analysis sections
3. PDF export functionality
4. Historical trend analysis (performance over time)
5. Head-to-head comparison mode
6. Interactive data visualizations

### 10.3 Demo Validation

The hackathon demonstration must show:
- Complete end-to-end workflow from team selection to report display
- At least 2 different team reports generated live
- Verification of data accuracy against known match results
- Navigation through all report sections

---

## 11. Appendices

### Appendix A: Sample Report Structure

A generated scouting report will follow this structure:

```
SCOUTING REPORT: [TEAM NAME]
Generated: [DATE] | Matches Analyzed: [N] | Date Range: [START-END]

EXECUTIVE SUMMARY
- Overall Record: W-L (Win%)
- Key Insight 1: [Actionable finding]
- Key Insight 2: [Actionable finding]
- Key Insight 3: [Actionable finding]

TEAM STRATEGIES
[Attack patterns, defense setups, pistol tendencies...]

PLAYER PROFILES
[Individual player breakdowns...]

COMPOSITIONS
[Most-played comps, win rates, map preferences...]

COUNTER-STRATEGIES (Confidence: High/Medium/Low)
[Actionable recommendations with data backing...]
```

### Appendix B: GRID API Reference

Key endpoints and queries used:
- Central Data API: `https://api-op.grid.gg/central-data/graphql`
- Series State API: `https://api-op.grid.gg/live-data-feed/series-state/graphql`
- Documentation: `https://grid.gg/docs`

### Appendix C: Glossary

| Term | Definition |
|------|------------|
| ACS | Average Combat Score - composite performance metric |
| KAST | Kill/Assist/Survive/Trade percentage per round |
| First Blood | First kill of a round |
| Eco Round | Round where team saves credits, minimal equipment purchase |
| Default | Standard setup or strategy executed without specific reads |
| Execute | Coordinated attack with utility to take a site |
| VCT | VALORANT Champions Tour - official professional circuit |

---

*— End of Document —*
