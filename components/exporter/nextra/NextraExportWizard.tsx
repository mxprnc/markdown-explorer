import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { useWizardStore } from '@/core/exporter/nextra/WizardStore';
import { Step1Identity } from './Step1Identity';
import { Step2Theming } from './Step2Theming';
import { Step3Options } from './Step3Options';
import { LivePreviewLite } from './LivePreviewLite';

import { ExportService } from '@/core/exporter/nextra/ExportService';
import { App } from '@/core/App';
import { ExportNode } from '@/core/exporter/nextra/types';

interface NextraExportWizardProps {
  app: App;
  targetNode: ExportNode | null;
  onComplete: () => void;
}

export const NextraExportWizard = ({ app, targetNode, onComplete }: NextraExportWizardProps) => {
  const { step, setStep, config, reset } = useWizardStore();
  const [isExporting, setIsExporting] = React.useState(false);

  const handleGenerate = async () => {
    if (!targetNode) return;
    
    setIsExporting(true);
    try {
      const service = new ExportService(app, config);
      await service.export(targetNode);
      onComplete();
    } catch (e) {
      console.error('Export failed', e);
      // alert('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1Identity />;
      case 2: return <Step2Theming />;
      case 3: return <Step3Options targetNode={targetNode} />;
      default: return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Export to Nextra</ThemedText>
        <ThemedText style={styles.stepIndicator}>Step {step} / 3</ThemedText>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView style={styles.formArea}>
          {renderStep()}
        </ScrollView>
        
        <View style={styles.previewArea}>
          <LivePreviewLite />
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          label="Cancel" 
          onPress={() => { reset(); onComplete(); }} 
          variant="outline"
          disabled={isExporting}
          testID="wizard-cancel-btn"
        />
        <View style={styles.rightButtons}>
          {step > 1 && (
            <Button 
              label="Previous" 
              onPress={() => setStep(step - 1)} 
              variant="secondary"
              style={{ marginRight: 8 }}
              disabled={isExporting}
              testID="wizard-prev-btn"
            />
          )}
          <Button 
            label={isExporting ? "Exporting..." : (step === 3 ? "Generate ZIP" : "Next")} 
            onPress={() => step < 3 ? setStep(step + 1) : handleGenerate()} 
            variant="primary"
            disabled={isExporting}
            testID="wizard-next-btn"
          />
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    minHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  stepIndicator: {
    opacity: 0.6,
    marginRight: 40, // Space for the close button in the modal
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  formArea: {
    flex: 3,
    paddingRight: 20,
  },
  previewArea: {
    flex: 2,
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
    paddingLeft: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  rightButtons: {
    flexDirection: 'row',
  }
});
