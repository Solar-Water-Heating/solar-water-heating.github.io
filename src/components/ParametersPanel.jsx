import React, { useState, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Tooltip } from './ui/tooltip'
import { RotateCcw, ChevronDown, Info } from 'lucide-react'

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
  parameterDescriptions,
}) => {
  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader className="flex-shrink-0">
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
      <CardContent className="flex-1 space-y-2 overflow-y-auto min-h-0">
        {Object.entries(sections).map(([sectionId, section]) => (
          <ParameterSection
            key={sectionId}
            sectionId={sectionId}
            section={section}
            sections={sections}
            parameters={parameters}
            onParameterChange={onParameterChange}
            onUpdate={onUpdate}
            isActive={activeSection === sectionId}
            onToggle={(newId) => onSectionChange(newId)}
            hasPendingUpdates={pendingUpdates[sectionId]}
            defaultParameters={defaultParameters}
            parameterDescriptions={parameterDescriptions}
          />
        ))}
      </CardContent>
    </Card>
  )
}

const ParameterSection = ({
  sectionId,
  section,
  sections,
  parameters,
  onParameterChange,
  onUpdate,
  isActive,
  onToggle,
  hasPendingUpdates,
  defaultParameters,
  parameterDescriptions,
}) => {
  const contentRef = useRef(null)
  const [contentWidth, setContentWidth] = useState(0)

  React.useEffect(() => {
    if (contentRef.current && isActive) {
      setContentWidth(contentRef.current.offsetWidth)
    }
  }, [isActive])

  return (
    <div className="border border-slate-600 rounded-lg overflow-hidden">
      {/* Section Header */}
      <button
        onClick={() => onToggle(isActive ? null : sectionId)}
        className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 flex items-center justify-between transition-colors"
      >
        <span className="font-semibold text-white">{section.title}</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${isActive ? 'rotate-0' : '-rotate-90'}`}
        />
      </button>

      {/* Section Content */}
      {isActive && (
        <div ref={contentRef} className="bg-slate-800 px-4 py-4 space-y-4 border-t border-slate-600">
          {/* Dependencies Notice */}
          {section.dependencies && section.dependencies.length > 0 && (
            <div className="bg-slate-700/50 border border-slate-600/50 rounded px-3 py-2">
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Info className="w-3 h-3 flex-shrink-0" />
                <span>Also uses: {section.dependencies.map((depId, idx) => {
                  const depSection = sections[depId]
                  const title = depSection?.title || depId
                  return (
                    <React.Fragment key={depId}>
                      {idx > 0 && ', '}
                      <span className="bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded text-xs font-medium">
                        {title}
                      </span>
                    </React.Fragment>
                  )
                })}</span>
              </p>
            </div>
          )}
          
          {/* Parameters */}
          <div className="space-y-4">
            {Object.entries(section.parameters).map(([paramKey]) => {
              const value = parameters[paramKey]
              const description = parameterDescriptions?.[paramKey]
              return (
                <div key={paramKey} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Label htmlFor={paramKey} className="capitalize text-white">
                        {description?.label || paramKey.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      {description && (
                        <Tooltip content={description.description} tooltipWidth={contentWidth}>
                          <Info className="w-4 h-4 text-slate-400 hover:text-slate-300 transition-colors" />
                        </Tooltip>
                      )}
                    </div>
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

