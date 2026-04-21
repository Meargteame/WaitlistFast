import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';

/**
 * Middleware to check if user can create a waitlist
 */
export function canCreateWaitlist(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const check = paymentService.canCreateWaitlist(req.userId);

  if (!check.allowed) {
    return res.status(403).json({
      error: 'Limit reached',
      message: check.reason,
      upgradeUrl: '/billing',
    });
  }

  next();
}

/**
 * Middleware to check if waitlist can accept signups
 * This checks the waitlist owner's limits
 */
export function canAcceptSignup(req: Request, res: Response, next: NextFunction) {
  // Get waitlist owner from request (should be set by previous middleware)
  const ownerId = (req as any).waitlistOwnerId;

  if (!ownerId) {
    return res.status(500).json({ error: 'Waitlist owner not found' });
  }

  const check = paymentService.canAcceptSignup(ownerId);

  if (!check.allowed) {
    return res.status(403).json({
      error: 'Waitlist is full',
      message: 'This waitlist has reached its signup limit.',
    });
  }

  next();
}
