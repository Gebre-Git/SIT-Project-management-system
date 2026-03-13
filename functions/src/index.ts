import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

admin.initializeApp();

// Re-export the presigned upload URL function
export { createPresignedUploadUrl } from './createPresignedUploadUrl';

// ============================================================================
// generateAdminInviteLink
// Callable by super_admin users only. Creates a time-limited invite token.
// ============================================================================
export const generateAdminInviteLink = functions.https.onCall(
    async (data, context) => {
        // 1. Auth check
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User must be authenticated.'
            );
        }

        // 2. Super-admin check
        if (context.auth.token.super_admin !== true) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'Only super-admins can generate invite links.'
            );
        }

        // 3. Validate input
        const { email } = data;
        if (!email || typeof email !== 'string') {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'A valid recipient email is required.'
            );
        }

        // 4. Generate token
        const tokenId = uuidv4();
        const now = admin.firestore.Timestamp.now();
        const expiresAt = admin.firestore.Timestamp.fromMillis(
            now.toMillis() + 24 * 60 * 60 * 1000 // 24 hours
        );

        await admin.firestore().collection('adminInvitationTokens').doc(tokenId).set({
            token: tokenId,
            createdAt: now,
            expiresAt: expiresAt,
            used: false,
            usedByUid: null,
            email: email.toLowerCase().trim(),
            createdByUid: context.auth.uid,
        });

        // 5. Build the invite link
        const baseUrl = 'https://crewspace-trial.vercel.app';
        const inviteLink = `${baseUrl}/admin-invite?token=${tokenId}`;

        return { success: true, inviteLink };
    }
);

// ============================================================================
// claimAdminInvite
// Callable by any authenticated user with a valid token.
// ============================================================================
export const claimAdminInvite = functions.https.onCall(
    async (data, context) => {
        // 1. Auth check
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User must be authenticated to claim an invite.'
            );
        }

        const { token } = data;
        if (!token || typeof token !== 'string') {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'A valid token is required.'
            );
        }

        const db = admin.firestore();
        const tokenRef = db.collection('adminInvitationTokens').doc(token);
        const tokenDoc = await tokenRef.get();

        // 2. Validate token exists
        if (!tokenDoc.exists) {
            throw new functions.https.HttpsError(
                'not-found',
                'Invalid or expired invitation token.'
            );
        }

        const tokenData = tokenDoc.data()!;

        // 3. Check if already used
        if (tokenData.used === true) {
            throw new functions.https.HttpsError(
                'already-exists',
                'This invitation has already been used.'
            );
        }

        // 4. Check expiration
        const now = admin.firestore.Timestamp.now();
        if (now.toMillis() > tokenData.expiresAt.toMillis()) {
            throw new functions.https.HttpsError(
                'deadline-exceeded',
                'This invitation has expired.'
            );
        }

        // 5. Verify email match
        const userEmail = context.auth.token.email?.toLowerCase().trim();
        if (userEmail !== tokenData.email) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'This invitation was sent to a different email address.'
            );
        }

        // 6. Mark token as used
        await tokenRef.update({
            used: true,
            usedByUid: context.auth.uid,
            usedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 7. Set super_admin custom claim
        await admin.auth().setCustomUserClaims(context.auth.uid, {
            super_admin: true,
        });

        return {
            success: true,
            message: 'You are now a super-admin! Please refresh your session.',
        };
    }
);

// ============================================================================
// setInitialSuperAdmin
// SECURE one-shot bootstrap function. Only works when NO super-admins exist.
// The caller can only promote themselves (email must match their own).
// ============================================================================
export const setInitialSuperAdmin = functions.https.onCall(
    async (data, context) => {
        // 1. Must be authenticated
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User must be authenticated.'
            );
        }

        const { email } = data;
        if (!email || typeof email !== 'string') {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'A valid email is required.'
            );
        }

        // 2. SECURITY: Caller can only promote themselves
        const callerEmail = context.auth.token.email?.toLowerCase().trim();
        if (callerEmail !== email.toLowerCase().trim()) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'You can only promote your own account.'
            );
        }

        // 3. SECURITY: Check that no super-admins exist yet
        //    List all users and check for the super_admin claim.
        //    This ensures this function is truly one-shot.
        const listResult = await admin.auth().listUsers(1000);
        const existingAdmins = listResult.users.filter(
            (u) => u.customClaims && u.customClaims.super_admin === true
        );

        if (existingAdmins.length > 0) {
            throw new functions.https.HttpsError(
                'already-exists',
                'A super-admin already exists. Use the invite system to add more admins.'
            );
        }

        // 4. Set the custom claim
        try {
            await admin.auth().setCustomUserClaims(context.auth.uid, {
                super_admin: true,
            });

            return {
                success: true,
                message: `Super-admin claim set for ${email}. Log out and log back in to activate.`,
            };
        } catch (error: any) {
            throw new functions.https.HttpsError(
                'internal',
                `Failed to set super-admin: ${error.message}`
            );
        }
    }
);
