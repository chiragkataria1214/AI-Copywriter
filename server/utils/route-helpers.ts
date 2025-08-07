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
        return res.status(404).json({ error: `${context} not found` });
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