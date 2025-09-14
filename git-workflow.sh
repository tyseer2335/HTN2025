#!/bin/bash

# HTN2025 Git Workflow Script
# This script helps manage the active development workflow

echo "🎯 HTN2025 Git Workflow Manager"
echo "================================"

# Function to show current status
show_status() {
    echo ""
    echo "📊 Current Git Status:"
    echo "====================="
    git branch -vv
    echo ""
    echo "🔄 Upstream Configuration:"
    echo "========================="
    git remote -v
    echo ""
}

# Function to switch to active development
switch_to_active_dev() {
    echo "🔄 Switching to active-development branch..."
    git checkout active-development
    echo "✅ Now on active-development branch"
    show_status
}

# Function to switch to working lens
switch_to_working_lens() {
    echo "🔄 Switching to working-lens branch..."
    git checkout working-lens
    echo "✅ Now on working-lens branch"
    show_status
}

# Function to sync working-lens with active-development
sync_working_lens() {
    echo "🔄 Syncing working-lens with active-development..."
    git checkout working-lens
    git merge active-development
    echo "✅ working-lens synced with active-development"
    show_status
}

# Function to promote working-lens to active-development
promote_to_active_dev() {
    echo "🚀 Promoting working-lens changes to active-development..."
    git checkout active-development
    git merge working-lens
    git push origin active-development
    echo "✅ Changes promoted to active-development and pushed to remote"
    show_status
}

# Function to create a new feature branch from active-development
create_feature_branch() {
    if [ -z "$1" ]; then
        echo "❌ Please provide a feature branch name"
        echo "Usage: $0 feature <branch-name>"
        exit 1
    fi
    
    echo "🌿 Creating feature branch: $1"
    git checkout active-development
    git checkout -b "feature/$1"
    echo "✅ Created and switched to feature/$1 branch"
    show_status
}

# Function to merge feature back to active-development
merge_feature() {
    if [ -z "$1" ]; then
        echo "❌ Please provide a feature branch name"
        echo "Usage: $0 merge-feature <branch-name>"
        exit 1
    fi
    
    echo "🔀 Merging feature/$1 back to active-development..."
    git checkout active-development
    git merge "feature/$1"
    git push origin active-development
    echo "✅ Feature merged and pushed to active-development"
    show_status
}

# Main script logic
case "$1" in
    "status")
        show_status
        ;;
    "active")
        switch_to_active_dev
        ;;
    "working")
        switch_to_working_lens
        ;;
    "sync")
        sync_working_lens
        ;;
    "promote")
        promote_to_active_dev
        ;;
    "feature")
        create_feature_branch "$2"
        ;;
    "merge-feature")
        merge_feature "$2"
        ;;
    "help"|"")
        echo ""
        echo "📋 Available Commands:"
        echo "====================="
        echo "  $0 status              - Show current git status"
        echo "  $0 active              - Switch to active-development branch"
        echo "  $0 working             - Switch to working-lens branch"
        echo "  $0 sync                - Sync working-lens with active-development"
        echo "  $0 promote             - Promote working-lens changes to active-development"
        echo "  $0 feature <name>      - Create new feature branch from active-development"
        echo "  $0 merge-feature <name> - Merge feature branch back to active-development"
        echo "  $0 help                - Show this help message"
        echo ""
        echo "🔄 Workflow:"
        echo "==========="
        echo "1. Work on 'working-lens' branch (for Snap Spectacles testing)"
        echo "2. Test manually on Snap Spectacles"
        echo "3. Run '$0 promote' to move changes to 'active-development'"
        echo "4. Create feature branches from 'active-development' for new features"
        echo "5. Merge features back to 'active-development' when ready"
        echo ""
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Run '$0 help' for available commands"
        exit 1
        ;;
esac
