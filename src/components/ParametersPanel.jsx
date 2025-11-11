import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { RotateCcw, ChevronDown } from 'lucide-react'

export const ParametersPanel = ({
  sections,
  parameters,
  onParameterChange,
  onUpdate,
  onReset,
  activeSection,
  onSectionChange,
  pendingUpdates,
  defaultParameters,
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Parameters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2 overflow-y-auto">
        {Object.entries(sections).map(([sectionId, section]) => (
          <ParameterSection
            key={sectionId}
            sectionId={sectionId}
            section={section}
            parameters={parameters}
            onParameterChange={onParameterChange}
            onUpdate={onUpdate}
            isActive={activeSection === sectionId}
            onToggle={() => onSectionChange(sectionId)}
            hasPendingUpdates={pendingUpdates[sectionId]}
            defaultParameters={defaultParameters}
          />
        ))}
      </CardContent>
    </Card>
  )
}

const ParameterSection = ({
  sectionId,
  section,
  parameters,
  onParameterChange,
  onUpdate,
  isActive,
  onToggle,
  hasPendingUpdates,
  defaultParameters,
}) => {
  return (
    <div className="border border-slate-600 rounded-lg overflow-hidden">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 flex items-center justify-between transition-colors"
      >
        <span className="font-semibold text-white">{section.title}</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isActive ? 'rotate-0' : '-rotate-90'}`}
        />
      </button>

      {/* Section Content */}
      {isActive && (
        <div className="bg-slate-800 px-4 py-4 space-y-4 border-t border-slate-600">
          {/* Parameters */}
          <div className="space-y-4">
            {Object.entries(section.parameters).map(([paramKey]) => {
              const value = parameters[paramKey]
              return (
                <div key={paramKey} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={paramKey} className="capitalize text-white">
                      {paramKey.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <span className="text-xs text-slate-400">
                      {typeof value === 'number' ? value.toFixed(2) : value}
                    </span>
                  </div>
                  <Input
                    id={paramKey}
                    type="number"
                    value={value}
                    onChange={(e) => onParameterChange(paramKey, e.target.value)}
                    step="0.1"
                    className="w-full bg-slate-700 border-slate-600 text-white"
                  />
                  {defaultParameters && defaultParameters[paramKey] !== undefined && (
                    <p className="text-xs text-slate-500">
                      Default: {defaultParameters[paramKey].toFixed(2)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Update Button */}
          <Button
            onClick={() => onUpdate(sectionId)}
            disabled={!hasPendingUpdates}
            className={`w-full ${
              hasPendingUpdates
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-600 text-slate-400 cursor-not-allowed'
            }`}
          >
            {hasPendingUpdates ? 'Update Plot' : 'Updated'}
          </Button>
        </div>
      )}
    </div>
  )
}

