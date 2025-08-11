import { CustomCopyTab } from '@/components/main/tabs/custom-copy/CustomCopyTab';
import { createTabProps, createDefaultMutation } from '@/components/main/shared';

export const CustomCopyTabs = (props: any) => {
    // Extract form state and handlers
    const { formState, handleInputChange, handleFormChange, contentRevision, ...restProps } = props;
    
    // Use shared utility to create tab props
    const customCopyTabProps = createTabProps(formState, handleInputChange, {
        ...restProps,
        // Convert products object to array as expected by CustomCopyTab
        products: restProps.products ? Object.values(restProps.products) : [],
        
        // Generated content 
        generatedCustomResponse: props.generatedCustomResponse || '',
        customRequestHistory: [], // Would need separate state management
        
        // Functions
        generateCustomCopyMutation: props.generationMutations?.generateCustomCopyMutation || createDefaultMutation(),
        
        // Revision states from contentRevision hook
        setSelectedItemForRevision: contentRevision?.setSelectedItemForRevision || (() => {}),
        setShowRevisionPanel: contentRevision?.setShowRevisionPanel || (() => {}),
        
        // Debug info manager
        debugInfoManager: props.debugInfoManager,
    });
    
    return <CustomCopyTab {...customCopyTabProps} />;
};