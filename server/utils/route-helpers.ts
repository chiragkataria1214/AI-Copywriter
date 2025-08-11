import type { Request, Response, NextFunction } from 'express';

/**
 * Generic error handler for API routes
 * Standardizes error logging and response format
 */
export function handleRouteError(
  error: unknown, 
  res: Response, 
  context: string,
  statusCode: number = 500
) {
  console.error(`Error ${context}:`, error);
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  res.status(statusCode).json({ 
    error: `Failed to ${context.toLowerCase()}`,
    message: statusCode < 500 ? message : undefined // Only include message for client errors
  });
}

/**
 * Higher-order function to wrap async route handlers with standardized error handling
 */
export function asyncRouteHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  context: string,
  statusCode: number = 500
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      handleRouteError(error, res, context, statusCode);
    }
  };
}

/**
 * Standardized success response helper
 */
export function sendSuccess(res: Response, data?: any, message?: string) {
  if (data === undefined) {
    res.json({ success: true, message: message || 'Operation completed successfully' });
  } else {
    res.json(data);
  }
}

/**
 * Validates API key configuration
 */
export function validateApiKey(res: Response): boolean {
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(400).json({ message: 'Anthropic API key not configured' });
    return false;
  }
  return true;
}

/**
 * Validates required fields
 */
export function validateRequiredFields(
  fields: Record<string, any>, 
  required: string[], 
  res: Response
): boolean {
  const missing = required.filter(field => !fields[field]);
  if (missing.length > 0) {
    res.status(400).json({ 
      error: `Missing required fields: ${missing.join(', ')}` 
    });
    return false;
  }
  return true;
}

/**
 * Gets current user ID from session
 */
export function getCurrentUserId(req: any): string {
  return (req.session as any)?.userId || 'demo-user';
}

/**
 * Generic framework CRUD operations
 */
export function createFrameworkRoutes(
  app: any,
  basePath: string,
  storage: {
    getAll: () => Promise<any[]>,
    getActive: () => Promise<any[]>,
    getByName: (name: string) => Promise<any>,
    getById: (id: string) => Promise<any>,
    create: (data: any) => Promise<any>,
    update: (id: string, data: any) => Promise<any>,
    updateByName: (name: string, data: any) => Promise<any>,
    deleteById: (id: string) => Promise<void>,
    seed?: () => Promise<void>
  },
  context: string,
  requireAdmin: any,
  requireAuth?: any
) {
  // GET all frameworks
  app.get(`/api/${basePath}`, asyncRouteHandler(async (req: any, res: any) => {
    const frameworks = await storage.getAll();
    res.json(frameworks);
  }, `fetch ${context} frameworks`));

  // GET active frameworks only
  app.get(`/api/${basePath}/active`, asyncRouteHandler(async (req: any, res: any) => {
    const frameworks = await storage.getActive();
    res.json(frameworks);
  }, `fetch active ${context} frameworks`));

  // GET single framework by name
  app.get(`/api/${basePath}/:name`, asyncRouteHandler(async (req: any, res: any) => {
    const { name } = req.params;
    const framework = await storage.getByName(name);
    if (!framework) {
      return res.status(404).json({ error: `${context} framework not found` });
    }
    res.json(framework);
  }, `fetch ${context} framework`));

  // POST create new framework
  app.post(`/api/${basePath}`, requireAdmin, asyncRouteHandler(async (req: any, res: any) => {
    const requiredFields = ['name', 'displayName', 'description', 'systemPrompt'];
    if (!validateRequiredFields(req.body, requiredFields, res)) return;

    const existingFramework = await storage.getByName(req.body.name);
    if (existingFramework) {
      return res.status(409).json({ error: "Framework with this name already exists" });
    }

    const newFramework = await storage.create({
      ...req.body,
      isActive: req.body.isActive || 'true',
      sortOrder: req.body.sortOrder || 0,
    });

    res.status(201).json({ success: true, framework: newFramework });
  }, `create ${context} framework`, 400));

  // PUT update framework by ID
  app.put(`/api/${basePath}/:id`, requireAdmin, asyncRouteHandler(async (req: any, res: any) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Framework ID is required" });
    }

    const updatedFramework = await storage.update(id, req.body);
    if (!updatedFramework) {
      return res.status(404).json({ error: "Framework not found" });
    }

    res.json({ success: true, framework: updatedFramework });
  }, `update ${context} framework`, 400));

  // PUT update framework by name (if requireAuth provided)
  if (requireAuth) {
    app.put(`/api/${basePath}/:name`, requireAuth, asyncRouteHandler(async (req: any, res: any) => {
      const { name } = req.params;
      const framework = await storage.updateByName(name, req.body);
      res.json(framework);
    }, `update ${context} framework by name`, 400));
  }

  // DELETE framework by ID
  app.delete(`/api/${basePath}/:id`, requireAdmin, asyncRouteHandler(async (req: any, res: any) => {
    const { id } = req.params;
    await storage.deleteById(id);
    res.json({ success: true, message: "Framework deleted successfully" });
  }, `delete ${context} framework`));

  // POST seed frameworks (if seed method provided)
  if (storage.seed) {
    app.post(`/api/${basePath}/seed`, requireAdmin, asyncRouteHandler(async (req: any, res: any) => {
      await storage.seed!();
      res.json({ success: true, message: `${context} frameworks seeded successfully` });
    }, `seed ${context} frameworks`));
  }
}

/**
 * Helper for CRUD operations - standardizes common patterns
 */
export const crudHandlers = {
  /**
   * GET all items
   */
  getAll: (storageMethod: () => Promise<any[]>, context: string) => 
    asyncRouteHandler(async (req, res) => {
      const items = await storageMethod();
      res.json(items);
    }, `fetch ${context}`),

  /**
   * GET item by ID
   */
  getById: (storageMethod: (id: string) => Promise<any>, context: string) =>
    asyncRouteHandler(async (req, res) => {
      const { id } = req.params;
      const item = await storageMethod(id);
      if (!item) {
        res.status(404).json({ error: `${context} not found` });
        return;
      }
      res.json(item);
    }, `fetch ${context}`),

  /**
   * POST create item
   */
  create: (storageMethod: (data: any) => Promise<any>, schema: any, context: string) =>
    asyncRouteHandler(async (req, res) => {
      const data = schema.parse(req.body);
      const item = await storageMethod(data);
      res.status(201).json(item);
    }, `create ${context}`, 400),

  /**
   * PUT update item
   */
  update: (storageMethod: (id: string, data: any) => Promise<any>, schema: any, context: string) =>
    asyncRouteHandler(async (req, res) => {
      const { id } = req.params;
      const data = schema.partial().parse(req.body);
      const item = await storageMethod(id, data);
      res.json(item);
    }, `update ${context}`, 400),

  /**
   * DELETE item
   */
  delete: (storageMethod: (id: string) => Promise<void>, context: string) =>
    asyncRouteHandler(async (req, res) => {
      const { id } = req.params;
      await storageMethod(id);
      sendSuccess(res);
    }, `delete ${context}`, 400)
};